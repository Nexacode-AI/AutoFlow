# Personal Expenses & Bank Statement Categorisation

**GitHub Issue:** #20 — assignee: SandeepaHWP  
**Wave:** 8 (Finance & Notifications) — unblocked after Wave 1 (#22 auth ✅)

---

## Overview

Admins upload their monthly bank statement PDFs to the system.
The backend extracts each transaction, auto-categorises it by keyword matching, and stores it.
Transactions the system cannot categorise land in **Others** — admins can reassign those manually.
The Finance → Personal Expenses tab shows a combined category breakdown plus per-admin tables.

---

## Architecture

```
PDF upload (multipart)
      │
      ▼
POST /api/v1/finance/personal/bank-statements/upload
      │
      ├─ Save PDF to UPLOAD_DIR (./uploads by default)
      ├─ parse_bank_statement()  ← pdfplumber (thread pool)
      │     ├─ Strategy 1: extract_tables()  (structured PDFs)
      │     └─ Strategy 2: extract_text()    (text-only fallback)
      ├─ detect_category()       ← keyword matching
      ├─ Write BankStatement row (status: completed)
      └─ Write PersonalExpense rows (one per transaction)
```

---

## Database Schema

### `bank_statements`

| Column              | Type                        | Notes                              |
|---------------------|-----------------------------|------------------------------------|
| `statement_id`      | UUID PK                     |                                    |
| `admin_id`          | UUID FK → users             |                                    |
| `filename`          | varchar(255)                | Original filename                  |
| `file_path`         | text                        | Absolute path on disk              |
| `status`            | enum                        | `processing` / `completed` / `failed` |
| `transaction_count` | int                         | Set after parse                    |
| `uploaded_at`       | datetime                    |                                    |

### `personal_expenses`

| Column               | Type          | Notes                                    |
|----------------------|---------------|------------------------------------------|
| `expense_id`         | UUID PK       |                                          |
| `statement_id`       | UUID FK       | → bank_statements                        |
| `admin_id`           | UUID FK       | → users                                  |
| `transaction_date`   | datetime      | Extracted from PDF                       |
| `description`        | text          | Raw description from bank statement      |
| `amount`             | numeric(10,2) | Debit amount (positive)                  |
| `category`           | enum          | See categories below                     |
| `is_recategorized`   | bool          | True if manually changed by admin        |
| `created_at`         | datetime      |                                          |

**Indexes:** `admin_id`, `category`, `statement_id`

---

## Expense Categories

| API value               | Display label          | Auto-detect keywords (sample)                |
|-------------------------|------------------------|----------------------------------------------|
| `fuel_transport`        | Fuel & Transport       | petrol, fuel, toll, parking, grab, highway   |
| `utilities`             | Utilities              | internet, broadband, unifi, maxis, phone, bill |
| `meals_entertainment`   | Meals & Entertainment  | lunch, dinner, meal, food, restaurant, cafe  |
| `office_stationery`     | Office & Stationery    | stationery, printing, courier, postage       |
| `training_development`  | Training & Development | training, course, workshop, seminar          |
| `marketing_advertising` | Marketing & Advertising | marketing, ads, advertising, campaign        |
| `equipment_maintenance` | Equipment & Maintenance | equipment, tools, maintenance, repair        |
| `others`                | Others                 | No keyword matched — requires manual review  |

---

## Privacy Model

- **Line items are private.** A regular `admin` only ever sees / uploads / recategorizes
  their *own* transactions. Requesting another admin's data returns `403`.
- **`super_admin` sees everything** and may upload statements for any admin-level user.
- **Combined totals are shared.** The `/summary` endpoint returns category totals and
  per-admin totals (amounts + counts only, never line items) to every admin.

## Upload Security

- Filenames are sanitized (`Path(...).name` + safe character set) and stored under a
  UUID prefix — path traversal via crafted filenames is not possible.
- File content is validated by magic bytes (`%PDF-`), not the spoofable
  `Content-Type` header.
- The `BankStatement` row is committed *before* parsing, so a slow PDF parse never
  holds a DB connection open; expenses + status are committed in a second transaction.

## API Endpoints

All endpoints require `admin` or `super_admin` role.  
Base prefix: `/api/v1/finance/personal`

### Upload bank statement

```
POST /bank-statements/upload
Content-Type: multipart/form-data
Query: ?admin_id=<uuid>
Body:  file=<PDF>
```

**Response `201`**

```json
{
  "statement_id": "...",
  "admin_id": "...",
  "filename": "april-2026.pdf",
  "status": "completed",
  "transaction_count": 12,
  "transactions": [ /* TransactionResponse[] */ ]
}
```

**Error cases**
- `403` — regular admin uploading for someone else
- `404` — admin_id not found
- `422` — target user is not an admin, file is not a real PDF (magic-byte check), or PDF could not be parsed

---

### List transactions

```
GET /transactions
GET /transactions?admin_id=<uuid>
GET /transactions?category=fuel_transport
GET /transactions?admin_id=<uuid>&category=utilities
```

**Response `200`** — array of `TransactionResponse`

```json
[
  {
    "expense_id": "...",
    "statement_id": "...",
    "admin_id": "...",
    "admin_name": "Ahmad",
    "transaction_date": "2026-04-01",
    "description": "Monthly Unifi broadband bill",
    "amount": 129.00,
    "category": "utilities",
    "category_label": "Utilities",
    "is_recategorized": false
  }
]
```

---

### Recategorize a transaction

```
PATCH /transactions/{expense_id}/category
Content-Type: application/json

{ "category": "office_stationery" }
```

**Response `200`** — updated `TransactionResponse`  
Sets `is_recategorized: true` on the record.

---

### Summary (category totals)

```
GET /summary
```

**Response `200`**

```json
{
  "grand_total": 3760.50,
  "unresolved_count": 3,
  "categories": [
    { "category": "utilities", "category_label": "Utilities", "total": 428.00, "count": 3 }
  ],
  "per_admin": {
    "<admin_uuid>": { "name": "Ahmad", "total": 2049.50, "count": 8 }
  }
}
```

---

## Files Changed

### Backend

| File | Change |
|------|--------|
| `app/infrastructure/base.py` | Added `PersonalExpenseCategory`, `BankStatementStatus` enums |
| `app/infrastructure/models/models.py` | Added `BankStatement`, `PersonalExpense` ORM models |
| `app/core/pdf_parser.py` | **New** — PDF parsing + keyword categorisation |
| `app/api/v1/routes/finance.py` | **New** — 4 API endpoints |
| `app/api/v1/router.py` | Registered finance router |
| `app/main.py` | Create UPLOAD_DIR on startup |
| `app/infrastructure/config.py` | Added `UPLOAD_DIR` setting |
| `requirements.txt` | Added `pdfplumber==0.11.4` |
| `.env.example` | Documented `UPLOAD_DIR` |
| `migrations/versions/b3f1a9c2e8d7_add_personal_expenses_tables.py` | **New** — Alembic migration |

### Frontend

| File | Change |
|------|--------|
| `src/data/finance.ts` | Replaced `category_1`–`7` placeholders with real names + real keyword matching |
| `src/lib/finance/api.ts` | **New** — typed API client for all 4 endpoints |
| `src/features/finance/PersonalExpenses.tsx` | Wired to real API: loading state, error state, real upload, real recategorisation |

---

## Local Setup

```bash
# Backend — install pdfplumber
cd backend
pip install -r requirements.txt

# Run migration
alembic upgrade head

# Start server (upload dir is created automatically on startup)
uvicorn app.main:app --reload
```

```bash
# Frontend
cd frontend
npm install
npm run dev
```

---

## PDF Parser Notes

The parser (`app/core/pdf_parser.py`) tries two strategies per page:

1. **Table extraction** (`pdfplumber.Page.extract_tables()`) — works for bank PDFs with embedded grid structure (most Malaysian banks).
2. **Line-by-line text parsing** — regex fallback for scanned/text-only PDFs.

The parser looks for rows matching:
- A **date** at the start of the row (`DD/MM/YYYY`, `DD-MM-YYYY`, `YYYY-MM-DD`, etc.)
- A **positive decimal amount** toward the end
- Everything in between is treated as the description

**Balance-column handling:** when a row contains multiple numeric values
(`Date | Desc | Debit | Credit | Balance` layouts), the rightmost is treated as the
running balance and skipped — the value before it is taken as the transaction amount.
A single numeric value is used as-is. Unit tests cover both layouts
(`tests/test_pdf_parser.py`).

If a PDF uses a format the parser doesn't recognise (zero transactions extracted), the statement is marked `completed` with `transaction_count: 0` and no expense rows are created. Extend `_parse_table_row` or `_parse_text_line` in `pdf_parser.py` to add bank-specific logic.
