#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

echo "Backing up PostgreSQL database..."
pg_dump "$DATABASE_URL" -F c -f "$BACKUP_DIR/trustflow_$TIMESTAMP.dump"

echo "Backing up .env..."
cp .env "$BACKUP_DIR/env_$TIMESTAMP.txt"

echo "Backup complete: $BACKUP_DIR/trustflow_$TIMESTAMP.dump"

# Keep last 30 days, remove older
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete
