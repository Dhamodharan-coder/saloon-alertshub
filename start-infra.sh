#!/bin/bash

echo "🚀 Starting Infrastructure (Postgres, Redis, Kafka)..."
docker-compose up -d postgres redis zookeeper kafka

echo ""
echo "✅ Infrastructure started!"
echo "   - Postgres: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - Kafka: localhost:9092"
echo ""
echo "You can now run 'npm run dev' to start the application."
