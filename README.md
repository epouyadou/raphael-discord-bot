Scaffold backend with:
- docker compose for development and production
- PostgreSQL 16
- Nest JS
- CI with Github Actions (TODO)
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

## Roadmap
- Refactore command handlers to not use discord.js `Client` class and creating a wrapper in `infrastructure` folder.
- Create unit test for the commands
- Add the command `/tracking display` to display user tracking connection orders:
  - Args:
    - Without: Display current user tracking connection orders
    - (Optional) mention:
      - `ROLE` mention: Display all the users tracking this role
      - `USER` mention: 
        - Display all the user's tracking connection orders
        - Display all the tracking connection orders created by the user
- Add security, to the existing commands, to not send connection notification if the tracked user is in a channel not accessible by the tracker.
- Add the command `/log voice-connection` to display the last voice connection in the guild:
  - Specifications:
    - Exclude channel that the invoker don't see.
    - Pagination
  - Args:
    - Without: Display the last guild member voice connections in DESC order (newest to older)
    - (optional) mention: 
      - `USER` mention: display the last connection of the user
      - `ROLE` mention: display the last connection of the users with the mentioned role
    - (optional) order: `ASC` (older to newest) or `DESC` (newest to older)
    - (optional) from and to: period constrains
- Add the command `/rank` to display ranking of divers informations:
  - Sub-commands: 
    - `time-spend-connected-in-voice-channels`:  Display the ranking of users order by how many time the user has spend time in the guild voice channels
      - Args:
        - Without: Display the ranking of users by how many time the user has spend time in the guild voice channels since the bot has been added
        - (Optional) period type:
          - `this day`: constraint the ranking to this day
          - `this month`: constraint the ranking to the past month
          - `this year`: constraint the ranking to the past year
    - `traking connection orders`: Display the ranking of users order by who has the most tracking connection orders
      - Args
        - (optional) order: `ASC` (older to newest) or `DESC` (newest to older)