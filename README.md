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
- Add the command `/disable tracking` to temporarily disable the tracking:
  - Args:
    - `duration`: `1s`, `30m`, `1h`, etc...
    - `mention` : `GuildMember` or `Role` to disable a specific tracking
- Add the command `/enable tracking` to reenable tracking.
  - Args:
    - `mention` : `GuildMember` or `Role` to disable a specific tracking
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
- Add the command `/genshin-remind`
  - Specifications:
    - Add redis to cache alarms (To optimize the check every minutes with a smaller set)
      - Dispose and Load the next chunk every given interval (1h, 10 minutes)
  - Args:
    - time: hour of the day
    - repeat interval: 
      - day
      - week
      - month
      - year
  - Sub-commands:
    - Specifications:
      - each 8 minutes -> +1 resine
    - `resine`: Remind the user to spend his resine when its full or at the given value
      - Args
        - Without: set current-resine to 0
        - (optional) current-resine: how many resine do you have
        - (optional) threshold: how many resine do you need to have to trigger the reminder
- Add a rate limit when notifiying someone to avoid being spam
- Add the command `/disallow tracking` to prevent a the user from being tracked. This should also remove :
  - All tracking orders he created.
  - All tracking orders that track him.
  - Remove all connection logs about him.
