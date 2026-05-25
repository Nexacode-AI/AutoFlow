"""Bank statement PDF parser for personal expense extraction.

Attempts to read transaction rows from a bank-statement PDF using two strategies:
  1. Table extraction (pdfplumber) — works for PDFs with embedded table structure.
  2. Line-by-line text parsing — fallback using regex for text-only PDFs.

Supports common Malaysian bank statement formats (Maybank, CIMB, RHB, Public Bank, etc.).
Callers receive a list of raw dicts; auto-categorisation is applied separately.
"""

import asyncio
import logging
import re
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Date patterns ─────────────────────────────────────────────────────────────
# DD/MM/YYYY, DD-MM-YYYY, DD/MM/YY, YYYY-MM-DD
_DATE_PATTERNS = [
    re.compile(r"\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})\b"),   # DD/MM/YYYY
    re.compile(r"\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{2})\b"),    # DD/MM/YY
    re.compile(r"\b(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})\b"),    # YYYY-MM-DD
]

# ── Amount pattern ────────────────────────────────────────────────────────────
_AMOUNT_RE = re.compile(r"([\d,]+\.\d{2})")


def _parse_date(raw: str) -> datetime | None:
    """Try every supported date format and return the first that parses."""
    raw = raw.strip()
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d/%m/%y", "%d-%m-%y",
                "%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue
    return None


def _parse_amount(raw: str) -> Decimal | None:
    """Strip thousands separators and return a Decimal, or None if not a number."""
    cleaned = raw.replace(",", "").strip()
    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None


def _row_from_cells(cells: list[str | None]) -> dict | None:
    """
    Try to extract (date, description, amount) from a table row.

    Heuristic: first cell that parses as a date = transaction date;
    last cell that parses as a positive amount = expense amount;
    everything in between collapses to description.
    """
    texts = [str(c).strip() if c else "" for c in cells]

    date_obj: datetime | None = None
    date_idx: int = -1
    for i, t in enumerate(texts):
        for pat in _DATE_PATTERNS:
            if pat.search(t):
                date_obj = _parse_date(pat.search(t).group(0))  # type: ignore[union-attr]
                if date_obj:
                    date_idx = i
                    break
        if date_obj:
            break

    if date_obj is None:
        return None

    # Scan right-to-left for the first numeric amount (skip balance column if present)
    amount: Decimal | None = None
    amount_idx: int = -1
    for i in range(len(texts) - 1, date_idx, -1):
        candidate = _parse_amount(texts[i])
        if candidate and candidate > 0:
            amount = candidate
            amount_idx = i
            break

    if amount is None:
        return None

    desc_parts = [
        t for i, t in enumerate(texts)
        if i != date_idx and i != amount_idx and t
    ]
    description = " ".join(desc_parts).strip() or "—"

    return {"date": date_obj, "description": description, "amount": amount}


def _row_from_line(line: str) -> dict | None:
    """
    Extract a transaction from a plain-text line.

    Strategy: find a leading date, a trailing amount, description in between.
    """
    line = line.strip()
    if not line:
        return None

    date_obj: datetime | None = None
    date_end: int = 0
    for pat in _DATE_PATTERNS:
        m = pat.match(line)
        if m:
            date_obj = _parse_date(m.group(0))
            date_end = m.end()
            break

    if date_obj is None:
        return None

    # Find all amounts on the line; use the last non-zero one
    amounts = [(m.start(), _parse_amount(m.group(1))) for m in _AMOUNT_RE.finditer(line)]
    amounts = [(s, a) for s, a in amounts if a and a > 0]
    if not amounts:
        return None

    # The rightmost amount is typically the transaction value
    last_amount_start, amount = amounts[-1]

    description = line[date_end:last_amount_start].strip(" \t|–-") or "—"

    return {"date": date_obj, "description": description, "amount": amount}


def _parse_pdf_sync(pdf_path: str) -> list[dict]:
    """Synchronous PDF parse — runs in a thread pool via parse_bank_statement()."""
    try:
        import pdfplumber  # imported here so the rest of the app loads without it
    except ImportError:
        logger.error("pdfplumber is not installed — run: pip install pdfplumber")
        return []

    transactions: list[dict] = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for _page_num, page in enumerate(pdf.pages, start=1):
                # Strategy 1: table extraction
                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        for row in table:
                            result = _row_from_cells(row)
                            if result:
                                transactions.append(result)
                    if transactions:
                        continue  # page had usable tables — skip text fallback

                # Strategy 2: text line parsing
                text = page.extract_text() or ""
                for line in text.split("\n"):
                    result = _row_from_line(line)
                    if result:
                        transactions.append(result)

    except Exception as exc:
        logger.error("Failed to parse PDF %s: %s", pdf_path, exc, exc_info=True)

    logger.info("Parsed %d transactions from %s", len(transactions), Path(pdf_path).name)
    return transactions


async def parse_bank_statement(pdf_path: str) -> list[dict]:
    """Parse a bank statement PDF and return a list of raw transaction dicts.

    Each dict has keys: date (datetime), description (str), amount (Decimal).
    Runs the synchronous pdfplumber call in a thread pool to avoid blocking the event loop.
    """
    return await asyncio.to_thread(_parse_pdf_sync, pdf_path)


# ── Auto-categorisation ───────────────────────────────────────────────────────

_CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "fuel_transport": [
        "petrol", "fuel", "toll", "parking", "grab", "ride",
        "transport", "commute", "highway", "mileage",
    ],
    "utilities": [
        "internet", "broadband", "unifi", "maxis", "celcom", "digi", "yes ",
        "phone", "mobile", "electricity", "water", "telco", "bill",
        "streamyx", "astro",
    ],
    "meals_entertainment": [
        "lunch", "dinner", "breakfast", "meal", "food", "restaurant",
        "cafe", "coffee", "entertainment", "client meal", "canteen",
    ],
    "office_stationery": [
        "stationery", "printing", "paper", "pen", "ink", "courier",
        "postage", "stamps", "office supplies", "binding",
    ],
    "training_development": [
        "training", "course", "workshop", "seminar", "certification",
        "books", "learning", "education", "conference",
    ],
    "marketing_advertising": [
        "marketing", "ads", "advertising", "social media", "promotion",
        "campaign", "google ads", "facebook", "instagram",
    ],
    "equipment_maintenance": [
        "equipment", "tools", "hardware", "maintenance", "service",
        "repair", "consumable", "battery", "cable",
    ],
}


def detect_category(description: str) -> str:
    """Return the best-matching PersonalExpenseCategory value for a description."""
    lower = description.lower()
    for category, keywords in _CATEGORY_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return category
    return "others"
