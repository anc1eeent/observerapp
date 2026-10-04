# observerApp

observerTasker is a smart to-do application where you can organize your day, create tasks, make notes, and control your time. It also serves as a learning mini-project to showcase my skills in backend development and DevOps.

# tech stack

# backend:
FastAPI - A modern web framework for building APIs with Python.
PostgreSQL - The relational database used for development and application persistence.

# frontend:
Vanilla (HTML / CSS / JS)

## Project Structure:
* `main.py` - The entry point of the application.
* `database.py` - Database configuration and setup.
* `models.py` - Database schemas and models.
* `index.html` - Frontend user interface.
* `script.js` - Frontend logic.

# roadmap:
my long-term goal is to build a large-scale application for my own use and release it as an open-source project for others. Through this project, I want to showcase and improve my skills in backend, frontend, and DevOps.

## Local Setup with Docker Compose

### Prerequisites

- Docker
- Docker Compose

### Environment Configuration

Create a local `.env` file from the provided example:

```powershell
Copy-Item .env.example .env
```

Replace the placeholder values in `.env` with local credentials.

The value of `POSTGRES_PASSWORD` must match the password used in `DATABASE_URL`. The database hostname in `DATABASE_URL` must remain `db`, which is the PostgreSQL service name inside Docker Compose.

Do not commit the local `.env` file.

### Start PostgreSQL

```powershell
docker compose up -d db
```

### Apply Database Migrations

```powershell
docker compose run --rm --build api alembic upgrade head
```

### Start the API

```powershell
docker compose up -d api
```

Verify that both services are running:

```powershell
docker compose ps
```

The API documentation is available at:

```text
http://localhost:8000/docs
```

### Stop the Application

```powershell
docker compose down
```

The PostgreSQL data remains stored in the Docker named volume after the containers are stopped.