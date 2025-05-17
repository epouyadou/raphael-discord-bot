Scaffold backend with:
- docker compose for development and production
- PostgreSQL 16
- Nest JS
- CI with Github Actions
- Hot Reload in development

## Prerequisites

To run the project you need to have docker and docker compose, see [Install Docker](https://docs.docker.com/engine/install/).


## How to run

Be sure to add permissions to the file `postgres-init-user-db.sh` locate in the `database` folder:
```bash
chmod +x database/postgres-init-user-db.sh
```

and run to start the backend in development mode with hot reload enabled:
```bash
docker compose up
```

Backend can be accessed at http://localhost:8080

Stop the backend with:
```bash
docker compose stop
```

To remove the containers and volumes run:
```bash
docker compose down -v
```

## How to rebuild when new packages are installed

When adding new npm packages you need to rebuild the docker image, you can do it with:
```bash
docker compose up --build
```

This will rebuild and run the containers.

## Folder Structure

- `api` NestJS backend
- `docker` Docker images for development and production
- `database` PostgreSQL database files to bootstrap the database on first run
- `.github` Github Actions CI/CD