# Support Ticket System - Docker Setup

## 🚀 Quick Start

Run the entire application with a single command:

```bash
docker-compose up --build
```

## 📋 Prerequisites

- Docker installed on your system
- Docker Compose installed
- `.env` file in the root directory with your `GEMINI_API_KEY`

## 🔑 Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

## 🐳 Docker Services

The application consists of three services:

- **db**: PostgreSQL 15 database
  - Port: 5432
  - Database: `tickets`
  - User: `postgres`
  - Password: `postgres`

- **backend**: Django REST API
  - Port: 8000
  - URL: http://localhost:8000

- **frontend**: React (Vite) application
  - Port: 5173
  - URL: http://localhost:5173

## 📦 What Happens on Startup

1. PostgreSQL database starts and waits for health check
2. Backend waits for database to be ready
3. Backend runs Django migrations automatically
4. Backend starts on port 8000
5. Frontend builds and serves on port 5173

## 🛠️ Useful Commands

### Start the application
```bash
docker-compose up --build
```

### Start in detached mode (background)
```bash
docker-compose up -d --build
```

### Stop the application
```bash
docker-compose down
```

### Stop and remove volumes (clean database)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f
```

### View logs for specific service
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Rebuild only one service
```bash
docker-compose up --build backend
```

### Execute Django commands
```bash
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py shell
```

### Access PostgreSQL
```bash
docker-compose exec db psql -U postgres -d tickets
```

## 🔍 Troubleshooting

### Port Already in Use
If you get a port conflict error:
- Change the port mapping in `docker-compose.yml`
- Or stop the service using that port

### Database Connection Issues
- Ensure the database service is healthy: `docker-compose ps`
- Check logs: `docker-compose logs db`

### Frontend Not Loading
- Check if backend is running: http://localhost:8000
- View frontend logs: `docker-compose logs frontend`

## 📁 Project Structure

```
Support-Ticket-System/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── entrypoint.sh
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── docker-compose.yml
├── .env
└── .env.example
```

## 🔄 Development vs Production

This Docker setup is configured for **development**. For production:

1. Set `DEBUG=False` in `.env`
2. Configure proper `ALLOWED_HOSTS`
3. Use production-grade web server (e.g., Gunicorn, Nginx)
4. Enable HTTPS
5. Use secrets management for sensitive data
6. Configure proper volume backups

## 💾 Data Persistence

Database data is persisted in a Docker volume named `postgres_data`. This ensures your data survives container restarts.

To backup your database:
```bash
docker-compose exec db pg_dump -U postgres tickets > backup.sql
```

To restore:
```bash
docker-compose exec -T db psql -U postgres tickets < backup.sql
```
