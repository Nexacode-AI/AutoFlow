"""Unit tests for the bank-statement PDF parser (Issue #20)."""
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from app.core.pdf_parser import (
    _row_from_cells,
    _row_from_line,
    detect_category,
    parse_bank_statement,
)

FIXTURES = Path(__file__).parent / "fixtures"

# ── _row_from_cells ───────────────────────────────────────────────────────────


def test_cells_simple_amount():
    row = _row_from_cells(["01/04/2026", "PETROL STATION KL", "210.00"])
    assert row is not None
    assert row["date"] == datetime(2026, 4, 1)
    assert row["description"] == "PETROL STATION KL"
    assert row["amount"] == Decimal("210.00")


def test_cells_skips_balance_column():
    # Date | Description | Debit | Balance — must pick the debit, not the balance
    row = _row_from_cells(["01/04/2026", "UNIFI BILL", "129.00", "4,871.00"])
    assert row is not None
    assert row["amount"] == Decimal("129.00")
    assert "4,871.00" not in row["description"]


def test_cells_debit_credit_balance_layout():
    # Date | Desc | Debit | Credit | Balance, debit row (credit cell empty)
    row = _row_from_cells(["02/04/2026", "MAXIS MOBILE", "88.00", "", "4,783.00"])
    assert row is not None
    assert row["amount"] == Decimal("88.00")


def test_cells_no_date_returns_none():
    assert _row_from_cells(["OPENING BALANCE", "", "5,000.00"]) is None


def test_cells_no_amount_returns_none():
    assert _row_from_cells(["01/04/2026", "STATEMENT PERIOD"]) is None


# ── _row_from_line ────────────────────────────────────────────────────────────


def test_line_single_amount():
    row = _row_from_line("01/04/2026 GRAB RIDE KLCC 25.50")
    assert row is not None
    assert row["amount"] == Decimal("25.50")
    assert row["description"] == "GRAB RIDE KLCC"


def test_line_skips_trailing_balance():
    # Amount followed by running balance — must take the amount
    row = _row_from_line("01/04/2026 PETROL STATION 210.00 4,790.00")
    assert row is not None
    assert row["amount"] == Decimal("210.00")
    assert row["description"] == "PETROL STATION"


def test_line_without_date_returns_none():
    assert _row_from_line("TOTAL DEBITS 1,234.00") is None


def test_line_empty_returns_none():
    assert _row_from_line("") is None


# ── detect_category ───────────────────────────────────────────────────────────


def test_detect_fuel():
    assert detect_category("PETRONAS PETROL STATION") == "fuel_transport"


def test_detect_utilities():
    assert detect_category("UNIFI BROADBAND MONTHLY") == "utilities"


def test_detect_meals():
    assert detect_category("Team lunch at cafe") == "meals_entertainment"


def test_detect_unknown_falls_to_others():
    assert detect_category("XYZ UNKNOWN MERCHANT 123") == "others"


# ── Full PDF end-to-end (real pdfplumber parse of the bundled fixture) ────────


async def test_parse_sample_statement_pdf():
    """The bundled sample statement has 8 rows in a Date|Desc|Debit|Balance
    table — every amount must come from the Debit column, never Balance."""
    txns = await parse_bank_statement(str(FIXTURES / "sample_bank_statement.pdf"))

    assert len(txns) == 8

    by_desc = {t["description"]: t for t in txns}
    petrol = next(t for d, t in by_desc.items() if "PETRONAS" in d)
    assert petrol["amount"] == Decimal("210.00")
    assert petrol["date"] == datetime(2026, 4, 1)

    balances = {Decimal("4790.00"), Decimal("4661.00"), Decimal("4635.50"),
                Decimal("4325.50"), Decimal("3705.50"), Decimal("3638.50"),
                Decimal("3188.50"), Decimal("3099.62")}
    assert not [t for t in txns if t["amount"] in balances]

    total = sum(t["amount"] for t in txns)
    assert total == Decimal("1900.38")
