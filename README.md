# Saloon AlertsHub - Notification & OTP Microservice

A production-ready microservice for handling notifications (Email, Push) and OTP flows with Kafka integration for reliable background processing.

## Features

- ✅ **Multi-provider Email Support**: Gmail, SendGrid, AWS SES, generic SMTP
- ✅ **Push Notifications**: Firebase Cloud Messaging (FCM) for Android/Web, Apple Push Notification Service (APNs) for iOS
- ✅ **OTP Management**: Secure generation, verification, rate limiting, and expiry handling
- ✅ **Kafka Integration**: Async processing via message queues
- ✅ **Template Engine**: Handlebars-based email templates  
- ✅ **Database Persistence**: PostgreSQL with Knex ORM
- ✅ **Redis Caching**: For OTP storage and rate limiting
- ✅ **Comprehensive Logging**: Winston logger with structured logging
- ✅ **API Documentation**: RESTful API with detailed endpoints
- ✅ **Containerization**: Docker and Docker Compose support
- ✅ **Kubernetes Ready**: Full K8s manifests with HPA
- ✅ **Testing**: Unit and integration tests with Jest

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       v
┌─────────────────────────────────────────┐
│         Express API Server              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │   OTP   │  │  Email  │  │  Push   ││
│  │ Service │  │ Service │  │ Service ││
│  └─────────┘  └─────────┘  └─────────┘│
└───────────┬─────────────────────────────┘
            │
     ┌──────┴──────┐
     v             v
┌─────────┐   ┌─────────────┐
│  Kafka  │   │  PostgreSQL │
│ Producer│   │  + Redis    │
└────┬────┘   └─────────────┘
     │
     v
┌─────────┐
│  Kafka  │
│Consumer │
└────┬────┘
     │
     v
┌─────────────────────┐
│  Email/Push Workers │
└─────────────────────┘
```

## Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 13
- **Redis** >= 6
- **Kafka** >= 2.8 (optional, for async processing)
- **Docker** & **Docker Compose** (for containerized deployment)

## Quick Start

### 1. Clone and Install

```bash
cd /home/dhamodharan/projects/saloon-alertshub
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=saloon_alertshub
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka (optional)
KAFKA_BROKERS=localhost:9092

# Email - Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### 3. Database Setup

```bash
# Run migrations
npm run migrate:latest

# Seed default templates
npm run seed:run
```

### 4. Start the Service

```bash
# Development
npm run dev

# Production
npm start
```

The service will be available at `http://localhost:3000`

## Docker Compose Deployment

The easiest way to run the entire stack:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

This starts:
- PostgreSQL database
- Redis cache
- Kafka + Zookeeper
- The notification service

## API Endpoints

### Health Check

```http
GET /api/v1/health
```

### OTP Endpoints

#### Request OTP

```http
POST /api/v1/otp/request
Content-Type: application/json

{
  "identifier": "user@example.com",
  "purpose": "login",
  "userName": "John Doe",
  "useKafka": false
}
```

#### Verify OTP

```http
POST /api/v1/otp/verify
Content-Type: application/json

{
  "identifier": "user@example.com",
  "otp": "123456",
  "purpose": "login"
}
```

### Email Endpoints

#### Send Templated Email

```http
POST /api/v1/email/send
Content-Type: application/json

{
  "to": "recipient@example.com",
  "templateName": "booking_confirmation",
  "data": {
    "userName": "John Doe",
    "serviceName": "Haircut",
    "bookingDate": "2023-12-01",
    "bookingTime": "10:00 AM",
    "location": "Downtown Salon"
  },
  "useKafka": false
}
```

#### Send Raw Email

```http
POST /api/v1/email/send
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Welcome!",
  "text": "Welcome to our service",
  "html": "<h1>Welcome!</h1><p>Thanks for joining us.</p>"
}
```

### Push Notification Endpoints

#### Send Push Notification

```http
POST /api/v1/push/send
Content-Type: application/json

{
  "userId": "user123",
  "title": "New Booking",
  "body": "You have a new booking at 10:00 AM",
  "data": {
    "bookingId": "booking123"
  },
  "platform": "ios",
  "useKafka": false
}
```

#### Register Device Token

```http
POST /api/v1/push/device/register
Content-Type: application/json

{
  "userId": "user123",
  "token": "fcm-token-or-apns-token",
  "platform": "ios",
  "deviceId": "ABC123",
  "deviceModel": "iPhone 14 Pro",
  "osVersion": "17.0",
  "appVersion": "1.0.0"
}
```

#### Unregister Device Token

```http
POST /api/v1/push/device/unregister
Content-Type: application/json

{
  "token": "fcm-token-or-apns-token"
}
```

## Email Provider Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Set in `.env`:

```env
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### SendGrid Setup

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

## Push Notification Setup

### Firebase Cloud Messaging (FCM)

1. Go to Firebase Console
2. Download service account JSON
3. Save to `config/firebase-service-account.json`
4. Set in `.env`:

```env
FCM_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

### Apple Push Notifications (APNs)

1. Download APNs auth key (.p8 file)
2. Save to `config/apns-key.p8`
3. Set in `.env`:

```env
APNS_KEY_PATH=./config/apns-key.p8
APNS_KEY_ID=your-key-id
APNS_TEAM_ID=your-team-id
APNS_BUNDLE_ID=com.yourapp.bundle
APNS_PRODUCTION=false
```

## Kafka Usage

When `useKafka: true` is set in API requests, notifications are queued to Kafka for asynchronous processing.

**Benefits:**
- Resilient to temporary failures
- Better performance under load
- Decoupled architecture

**Topics:**
- `email-notifications` - Email sending jobs
- `push-notifications` - Push notification jobs
- `otp-requests` - OTP generation and sending

## Database Schema

### Tables

- **notifications**: Stores all notification records
- **otps**: Secure OTP storage with hashing
- **notification_templates**: Configurable templates
- **device_tokens**: Push notification device registry
- **audit_logs**: Comprehensive audit trail

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run integration tests only
npm run test:integration

# Watch mode
npm run test:watch
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster
- `kubectl` configured
- Container registry (optional)

### Deploy

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n saloon-alertshub

# View logs
kubectl logs -f deployment/alertshub-deployment -n saloon-alertshub

# Scale manually
kubectl scale deployment alertshub-deployment --replicas=5 -n saloon-alertshub
```

### Update Secrets

Edit `k8s/configmap.yaml` with your credentials before deploying.

## Monitoring

The service exposes health check endpoints for monitoring:

- **Liveness**: `/api/v1/health`
- **Email Health**: `/api/v1/email/health`

## Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with auto-reload
npm test               # Run tests
npm run migrate:latest # Run database migrations
npm run migrate:rollback # Rollback last migration
npm run seed:run       # Seed database with templates
npm run lint           # Run ESLint
npm run docker:build   # Build Docker image
npm run docker:up      # Start Docker Compose
npm run k8s:apply      # Deploy to Kubernetes
```

## Security Considerations

- API keys and secrets stored in environment variables
- OTPs hashed with bcrypt before storage
- Rate limiting on OTP requests
- Non-root container user
- Helmet.js security headers
- CORS configuration

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
