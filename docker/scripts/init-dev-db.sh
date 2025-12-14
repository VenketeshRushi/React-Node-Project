#!/bin/bash
set -e

echo "🚀 Running Postgres initialization script..."

# Environment variables
POSTGRES_USER="${POSTGRES_SUPERUSER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_SUPERUSER_PASSWORD-postgres}"
DB_USER="${DB_USER:-devuser}"
DB_PASSWORD="${DB_PASSWORD:-devpass123}"
DB_NAME="${DB_NAME:-test_db}"

echo "📋 Configuration:"
echo "   POSTGRES_USER: $POSTGRES_USER"
echo "   DB_USER: $DB_USER"
echo "   DB_NAME: $DB_NAME"

# ---------------------------------------
# 1️⃣ Create or update user
# ---------------------------------------
psql --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
      EXECUTE format('CREATE ROLE %I WITH LOGIN PASSWORD %L CREATEDB', '${DB_USER}', '${DB_PASSWORD}');
      RAISE NOTICE '✅ Role ${DB_USER} created with CREATEDB privilege.';
   ELSE
      EXECUTE format('ALTER ROLE %I WITH PASSWORD %L CREATEDB', '${DB_USER}', '${DB_PASSWORD}');
      RAISE NOTICE '✅ Role ${DB_USER} exists, password and privileges updated.';
   END IF;
END
\$\$;
EOSQL

# ---------------------------------------
# 2️⃣ Create database (must be top-level, not in DO block)
# ---------------------------------------
if ! psql --username "$POSTGRES_USER" --dbname postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    psql --username "$POSTGRES_USER" --dbname postgres -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";"
    echo "✅ Database $DB_NAME created."
else
    echo "ℹ️ Database $DB_NAME already exists, skipping creation."
fi

# ---------------------------------------
# 3️⃣ Enable extensions and grant privileges
# ---------------------------------------
psql --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-EOSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
GRANT ALL PRIVILEGES ON SCHEMA public TO "$DB_USER";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "$DB_USER";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "$DB_USER";
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO "$DB_USER";

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$DB_USER";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$DB_USER";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO "$DB_USER";
EOSQL

echo "✅ Database setup completed successfully!"
