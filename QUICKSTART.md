# Quick Start Guide

## Immediate Setup

Since you have PostgreSQL credentials already, follow these steps:

### 1. Configure Environment

Create `.env` file and add:

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Your existing database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=saloon_alertshub
DB_USER=postgres
DB_PASSWORD=Dhru@2722

# Redis (install if needed)
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka (optional - can skip for now)
KAFKA_BROKERS=localhost:9092

# Your email config
EMAIL_PROVIDER=gmail
GMAIL_USER=nakkulnakkul1024@gmail.com
GMAIL_APP_PASSWORD=<GET_FROM_GOOGLE>

# OTP Settings
OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6
OTP_MAX_ATTEMPTS=3
```

### 2. Get Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Enable 2FA if not already enabled
3. Create a new App Password for "Mail"
4. Copy the 16-character password
5. Add it to `.env` as `GMAIL_APP_PASSWORD`

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Database

```bash
# Run migrations
npm run migrate:latest

# Seed default email templates
npm run seed:run
```

### 5. Start Services

**Option A: Full Stack with Docker (Recommended)**

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, Kafka, and the app.

**Option B: Run Locally**

```bash
# Install and start Redis
# Ubuntu/Debian:
sudo apt-get install redis-server
redis-server

# Start the app
npm run dev
```

### 6. Test the API

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Request OTP
curl -X POST http://localhost:3000/api/v1/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "your-email@example.com",
    "purpose": "login",
    "userName": "Test User"
  }'

# Check your email for the OTP, then verify:
curl -X POST http://localhost:3000/api/v1/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "your-email@example.com",
    "otp": "123456",
    "purpose": "login"
  }'
```

## Testing Without Email

If you don't want to set up email immediately, you can:

1. Check the logs - OTPs are logged in development mode
2. Query the database:
   ```sql
   SELECT * FROM otps WHERE identifier = 'your-email' ORDER BY created_at DESC LIMIT 1;
   ```

## Import Postman Collection

Import `postman_collection.json` into Postman for easy API testing.

## Common Issues

**Redis not found:**
```bash
# Install Redis
sudo apt-get install redis-server
# or use Docker
docker run -d -p 6379:6379 redis:alpine
```

**Kafka not needed:**
- Set `useKafka: false` in API requests
- Service works fine without Kafka for synchronous processing

**Database errors:**
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify database exists
psql -h localhost -U postgres -l
```

## Next Steps

1. ✅ Configure `.env` with your credentials
2. ✅ Install dependencies
3. ✅ Run migrations
4. ✅ Start the service
5. ✅ Test with the OTP flow
6. 📖 Read full documentation in `README.md`
7. 📖 Check `docs/API.md` for complete API reference
8. 🚀 Deploy using `docs/DEPLOYMENT.md`

## Production Deployment

When ready for production:

1. Use Docker Compose: `docker-compose up -d`
2. Or deploy to Kubernetes: `kubectl apply -f k8s/`
3. Configure managed services for PostgreSQL, Redis, Kafka
4. Set up monitoring and logging
5. Enable SSL/TLS
6. Configure proper secrets management

## Support

Check these files for detailed information:
- `README.md` - Complete overview
- `docs/API.md` - API documentation
- `docs/DEPLOYMENT.md` - Deployment guide
