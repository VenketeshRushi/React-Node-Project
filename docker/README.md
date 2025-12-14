---
# 🚀 Backend Development Environment

This project provides a **complete backend development environment** with **PostgreSQL**, **Redis**.
---

## 📦 Services Overview

| Service                     | Port  | Description                                       |
| --------------------------- | ----- | ------------------------------------------------- |
| **PostgreSQL**              | 5433  | Database with `pgvector`, initialized via scripts |
| **Redis**                   | 6379  | Cache & message broker                            |

---

## ⚡ Quick Start (Development)

1. **Configure environment variables:**

```bash
nano .env
```

2. **Create necessary directories:**

```bash
mkdir -p scripts/backup
```

3. **Ensure init scripts are executable:**

```bash
dos2unix scripts/init-dev-db.sh
chmod +x scripts/init-dev-db.sh
```

4. **Start all services:**

```bash
docker-compose up -d
```

5. **Check service status:**

```bash
docker-compose ps
```

---

## 🔗 Access Services

- **PostgreSQL:** `localhost:5433`
- **Redis:** `localhost:6379`

---

## 📝 Common Docker Commands

```bash
# View logs for any service
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Stop services (keep volumes/data)
docker-compose down

# Stop services and remove all volumes ⚠️
docker-compose down -v

# Inspect service health
docker-compose ps
```

---

## 🗄️ Database Access

```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U postgres -d myapp_db

# Connect to Redis
docker exec -it redis redis-cli -a $REDIS_PASSWORD
```

---

## 🐛 Troubleshooting

```bash
# View service logs
docker-compose logs [service-name]

# Check port usage
lsof -i :5433

# Clean restart (removes all data)
docker-compose down -v
docker-compose up -d
```

---

## 💾 Backup & Restore

```bash
# Backup PostgreSQL
docker exec postgres pg_dump -U postgres myapp_db > backup.sql

# Backup Redis
docker exec redis redis-cli -a $REDIS_PASSWORD SAVE
docker cp redis:/data/dump.rdb ./redis_backup.rdb
```
