# ObserverTasker

[![CI](https://github.com/anc1eeent/observerapp/actions/workflows/ci.yml/badge.svg)](https://github.com/anc1eeent/observerapp/actions/workflows/ci.yml)

ObserverTasker is a to-do application where you can organize your day, manage tasks and track focus time with a Pomodoro timer. It is also a learning project to practice backend development and DevOps.

## Features

- **Tasks** with priorities, due dates and descriptions; overdue tasks are highlighted.
- **Search and sorting** by priority, due date or creation time.
- **Pomodoro timer** linked to a task; the focus time is shown on each task.
- **Focus statistics:** today's focus time, the last 7 days as a chart and recent sessions.
- **Profile** with email, avatar and password change.
- Input validation on both the frontend and the API, readable error messages.

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, Pydantic, Alembic
- **Database:** PostgreSQL
- **Frontend:** vanilla HTML, CSS and JavaScript (ES modules)
- **Infrastructure:** Docker, Docker Compose, GitHub Actions

## Project Structure

```text
src/
├── main.py          # application entry point
├── database.py      # database engine and session
├── db_models.py     # registry of all ORM models (used by the app and Alembic)
├── users/           # registration, login, profile
├── tasks/           # tasks and task lists
├── pomodoro/        # Pomodoro sessions
└── habits/          # habit tracking (in progress)
alembic/             # database migrations
frontend/            # web interface
scripts/             # helper scripts (demo data)
tests/               # API tests
```

Each domain folder contains `router.py` (endpoints), `schemas.py` (request and response validation), `service.py` (business logic) and `models.py` (database tables).

## Local Setup with Docker Compose

### Prerequisites

- Docker with Docker Compose

### Environment Configuration

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Replace the placeholder values in `.env`. Generate a secret key with:

```powershell
docker run --rm python:3.12-slim python -c "import secrets; print(secrets.token_urlsafe(32))"
```

The value of `POSTGRES_PASSWORD` must match the password in `DATABASE_URL`. The database host in `DATABASE_URL` must stay `db`, the PostgreSQL service name inside Docker Compose.

Do not commit the `.env` file.

### Start the Application

```powershell
docker compose up -d db
docker compose run --rm --build api alembic upgrade head
docker compose up -d api
```

Check that both services are running:

```powershell
docker compose ps
```

The API documentation is available at http://localhost:8000/docs.

### Load Demo Data (optional)

```powershell
docker compose run --rm api python -m scripts.seed
```

This creates the user `demo` (password `demo-password`) with tasks and a week of Pomodoro sessions. Running it again replaces the demo data instead of duplicating it.

### Open the Frontend

The frontend uses ES modules, so it must be served over HTTP:

```powershell
cd frontend
python -m http.server 5500
```

Then open http://localhost:5500.

### Run the Tests

```powershell
docker compose run --rm --build api sh -c "pip install -q -r requirements/dev.txt && pytest -q"
```

The same tests run in CI on every pull request.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
