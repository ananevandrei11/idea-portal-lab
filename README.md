# Idea Portal Lab

A learning project for PostgreSQL, Docker, and Next.js 15.

## Prerequisites

- [Docker](https://www.docker.com/) installed and running
- Node.js 20+

## Getting Started

### 1. Copy environment variables

```bash
cp .env.example .env
```

Edit `.env` if you need to change credentials or port.

### 2. Start the database

```bash
docker compose up -d
```

### 3. Verify the database is running

```bash
docker compose ps
```

The `STATUS` column should show `healthy` (may take 10–15 seconds on first run).

### 4. Open pgAdmin (browser UI)

Go to [http://localhost:5050](http://localhost:5050)

Login with:
- **Email:** `admin@local.dev`
- **Password:** `admin`

To connect to the database in pgAdmin:
1. Right-click **Servers** → **Register** → **Server**
2. **Name:** `idea-portal-local`
3. **Connection tab:**
   - Host: `db` (the Docker service name)
   - Port: `5432`
   - Maintenance database: `idea_portal_dev`
   - Username: `idea_user`
   - Password: `idea_secret`

### 5. Start the Next.js app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Next.js Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (with hot reload) |
| `npm run build` | Build the app for production |
| `npm run start` | Start production server (after build) |
| `npm run lint` | Check code for errors with ESLint |

## Useful Docker Commands

| Command | Description |
|---|---|
| `docker compose up -d` | Start containers in background |
| `docker compose down` | Stop containers (data is preserved) |
| `docker compose down -v` | Stop and delete all data (clean slate) |
| `docker compose ps` | Check container status |
| `docker compose logs db` | View database logs |
| `docker compose exec db psql -U idea_user -d idea_portal_dev` | Open psql shell |
