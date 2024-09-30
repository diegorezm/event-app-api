# Event app api

## Development

### Folder structure

- `src/`: source code
- `src/db/`: database connection setup and schema
- `src/models/`: database models
- `src/repositories/`: database operations
- `src/services/`: gets data from the database via repository and sends to the controller
- `src/routes/`: where the routes are defined
- `src/utils/`: utilities that are used in different parts of the project
- `src/di`: Dependency injection

### Setup

- install dependencies

```
npm install
```

- setup env variables

```
cp .env.example .env
```

- run docker

```
docker compose -f docker-compose.dev.yaml up -d
```

- generate migrations

```
npm run db:generate
```

- run migrations

```
npm run db:migrate
```

- run tests

```
npm run test
```

- run the project

```
npm run dev
```
