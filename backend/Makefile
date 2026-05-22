.PHONY: install dev seed test lint migrate revision

install:        ## Install dependencies
	pip install -r requirements.txt

dev:            ## Run the API with auto-reload
	uvicorn app.main:app --reload --port 8000

seed:           ## Seed roles, step definitions and the starter admin user
	python -m app.infrastructure.seed

test:           ## Run the test suite
	pytest -q

lint:           ## Lint with ruff
	ruff check .

migrate:        ## Apply all pending migrations
	alembic upgrade head

revision:       ## Autogenerate a migration — usage: make revision m="message"
	alembic revision --autogenerate -m "$(m)"
