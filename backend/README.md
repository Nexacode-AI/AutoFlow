# AutoFlow — Backend

FastAPI backend for the AutoFlow workshop management system.

## Stack

- **FastAPI** — web framework
- **PostgreSQL** + **SQLAlchemy 2.0** (async) — database
- **Alembic** — migrations
- **python-jose** + **passlib** — JWT auth & password hashing
- **pytest** — tests

## Project layout

```
backend/
├── app/
│   ├── main.py                  # FastAPI app factory + entry point
│   ├── core/                    # security (JWT, password hashing)
│   ├── api/
│   │   ├── dependencies.py      # shared deps: get_db, get_current_user
│   │   └── v1/
│   │       ├── router.py        # v1 router aggregator
│   │       └── routes/          # one module per feature (P1–P7)
│   ├── application/             # use-cases & DTOs (per feature)
│   ├── domain/                  # entities & repository interfaces
│   ├── infrastructure/
│   │   ├── config.py            # settings (env vars)
│   │   ├── session.py           # async engine & session
│   │   ├── base.py              # declarative Base + enums
│   │   ├── models/              # SQLAlchemy ORM models
│   │   └── seed.py              # reference-data seed
│   └── middleware/              # CORS, etc.
├── migrations/                  # Alembic
└── tests/
```

Each feature owner (P1–P7) builds their slice across the
`domain → application → infrastructure → api` layers and registers their
router in `app/api/v1/router.py`.

## Quick start

### Option A — Docker (recommended)

From the repository root:

```bash
docker compose up
```

This starts PostgreSQL, the backend (`:8000`), and the frontend (`:5174`).

### Option B — Local

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
make install                       # install dependencies
cp .env.example .env                # then edit values
docker compose up postgres          # or use your own Postgres
make seed                           # roles + step definitions + admin user
make dev                            # http://localhost:8000/docs
```

## Default login accounts

After `make seed`, three accounts are created — one per role:

| Role | Email | Password |
|---|---|---|
| `super_admin` | `admin@autoflow.local` | `admin123` |
| `admin` | `admin2@autoflow.local` | `admin123` |
| `bay` | `bay@autoflow.local` | `bay123` |

> Change passwords after first login. All accounts are idempotent — re-running `make seed` will not create duplicates.

**Role capabilities at a glance:**
- `super_admin` — full access, sees all financials, can manage all users and suppliers
- `admin` — workflow oversight, supplier management, quotations, payments (no P&L view)
- `bay` — mechanic/service advisor: inspection, diagnosis, repair steps (no supplier or finance access)

## Common commands

```bash
make dev        # run API with auto-reload
make seed       # seed reference data
make test       # run tests
make lint       # ruff lint
make migrate    # apply migrations
make revision m="add jobs table"   # autogenerate a migration
```

## API docs

Interactive docs are at `http://localhost:8000/docs` once running.
