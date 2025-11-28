#!/bin/bash

# Saloon AlertsHub - Quick Setup Script

echo "🚀 Setting up Saloon AlertsHub Notification Service..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    
    # Update with provided credentials
    sed -i 's/DB_PASSWORD=your_password_here/DB_PASSWORD=Dhru@2722/' .env
    sed -i 's/GMAIL_USER=nakkulnakkul1024@gmail.com/GMAIL_USER=nakkulnakkul1024@gmail.com/' .env
    
    echo "⚠️  IMPORTANT: Please update GMAIL_APP_PASSWORD in .env file"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if nc -z localhost 5432 2>/dev/null; then
    echo "✅ PostgreSQL is running"
    
    # Run migrations
    echo "🗄️  Running database migrations..."
    npm run migrate:latest
    
    # Seed templates
    echo "🌱 Seeding default templates..."
    npm run seed:run
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "📚 Next steps:"
    echo "   1. Update GMAIL_APP_PASSWORD in .env file"
    echo "   2. Start Redis: redis-server (or use Docker Compose)"
    echo "   3. Start Kafka (optional): docker-compose up -d kafka"
    echo "   4. Start the service: npm run dev"
else
    echo "⚠️  PostgreSQL is not running on port 5432"
    echo ""
    echo "Option 1: Start PostgreSQL locally"
    echo "Option 2: Use Docker Compose: docker-compose up -d"
    echo ""
    echo "After starting PostgreSQL, run:"
    echo "  npm run migrate:latest"
    echo "  npm run seed:run"
fi

echo ""
echo "📖 For more information, see README.md"
