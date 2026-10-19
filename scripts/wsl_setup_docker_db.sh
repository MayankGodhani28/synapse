#!/bin/bash
# Run inside Ubuntu WSL2 to install Docker Engine and set up the Synapse database
# Usage: wsl -d Ubuntu -- bash /mnt/e/synepse/scripts/wsl_setup_docker_db.sh

set -e

echo ""
echo "=== [1/5] Installing Docker Engine in Ubuntu ===" 
# Remove any old docker packages
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install prerequisites
sudo apt-get update -qq
sudo apt-get install -y -qq ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker apt repo
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker
sudo service docker start
sleep 3
sudo docker ps
echo "Docker Engine installed and running!"

echo ""
echo "=== [2/5] Pulling pgvector image ==="
sudo docker pull pgvector/pgvector:pg16

echo ""
echo "=== [3/5] Starting synapse-db container ==="
sudo docker run --name synapse-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16

# Wait for postgres
echo "Waiting for Postgres to be ready..."
for i in {1..20}; do
  sleep 2
  if sudo docker exec synapse-db pg_isready -U postgres 2>/dev/null | grep -q "accepting"; then
    echo "Postgres ready!"
    break
  fi
  echo "  ...waiting ($((i*2))s)"
done

echo ""
echo "=== [4/5] Creating database and enabling pgvector ==="
sudo docker exec synapse-db psql -U postgres -c "CREATE DATABASE synapse;"
sudo docker exec synapse-db psql -U postgres -d synapse -c "CREATE EXTENSION IF NOT EXISTS vector;"
echo "pgvector enabled!"

echo ""
echo "=== [5/5] Applying schema ==="
sudo docker exec -i synapse-db psql -U postgres -d synapse < /mnt/e/synepse/db/schema.sql
echo "Schema applied!"

echo ""
echo "=== Verifying tables ==="
sudo docker exec synapse-db psql -U postgres -d synapse -c '\dt'

echo ""
echo "=== Seeding test data ==="
sudo docker exec -i synapse-db psql -U postgres -d synapse << 'EOSQL'
DO $$
DECLARE
  uid UUID;
  mid UUID;
BEGIN
  INSERT INTO users (email, password_hash)
    VALUES ('test@example.com', 'dummyhash')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO uid;
  IF uid IS NULL THEN
    SELECT id INTO uid FROM users WHERE email = 'test@example.com';
  END IF;
  INSERT INTO memories (user_id, content, source_type)
    VALUES (uid, 'Test memory content', 'note')
    RETURNING id INTO mid;
  RAISE NOTICE 'Created memory id: %', mid;
END;
$$;
SELECT id, user_id, content, source_type, created_at FROM memories;
EOSQL

echo ""
echo "================================================"
echo " Synapse DB is READY!"
echo " Connection: postgresql://postgres:yourpassword@localhost:5432/synapse"
echo "================================================"
