# Project Structure

```
saloon-alertshub/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection with Knex
│   │   ├── redis.js             # Redis client configuration
│   │   └── kafka.js             # Kafka producer/consumer setup
│   ├── controllers/
│   │   ├── otp.controller.js    # OTP request/verify handlers
│   │   ├── email.controller.js  # Email sending handlers
│   │   └── push.controller.js   # Push notification handlers
│   ├── services/
│   │   ├── otp.service.js       # OTP generation/validation logic
│   │   ├── kafka.producer.js    # Kafka message publishing
│   │   ├── kafka.consumer.js    # Kafka message consumption
│   │   ├── email/
│   │   │   ├── email.service.js          # Email orchestration
│   │   │   └── providers/
│   │   │       ├── gmail.provider.js     # Gmail integration
│   │   │       └── sendgrid.provider.js  # SendGrid integration
│   │   └── push/
│   │       ├── push.service.js           # Push orchestration
│   │       └── providers/
│   │           ├── fcm.provider.js       # Firebase Cloud Messaging
│   │           └── apns.provider.js      # Apple Push Notifications
│   ├── routes/
│   │   ├── index.js             # Main router
│   │   ├── otp.routes.js        # OTP endpoints
│   │   ├── email.routes.js      # Email endpoints
│   │   └── push.routes.js       # Push endpoints
│   ├── utils/
│   │   └── logger.js            # Winston logger configuration
│   └── index.js                 # Application entry point
├── db/
│   ├── migrations/              # Database schema migrations
│   │   ├── 20231128000001_create_notifications_table.js
│   │   ├── 20231128000002_create_otps_table.js
│   │   ├── 20231128000003_create_notification_templates_table.js
│   │   ├── 20231128000004_create_device_tokens_table.js
│   │   └── 20231128000005_create_audit_logs_table.js
│   └── seeds/
│       └── 01_templates.js      # Default email templates
├── tests/
│   ├── unit/
│   │   └── otp.service.test.js  # OTP service unit tests
│   └── integration/
│       └── api.test.js          # API integration tests
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── deployment.yaml
│   └── hpa.yaml
├── docs/
│   ├── API.md                   # Complete API documentation
│   └── DEPLOYMENT.md            # Deployment guide
├── config/                      # Service account files (gitignored)
│   ├── firebase-service-account.json
│   └── apns-key.p8
├── .env.example                 # Environment template
├── .gitignore
├── .dockerignore
├── .eslintrc.js
├── docker-compose.yml           # Local development stack
├── Dockerfile                   # Production container image
├── jest.config.js               # Test configuration
├── knexfile.js                  # Database configuration
├── package.json                 # Dependencies and scripts
├── postman_collection.json      # API testing collection
├── setup.sh                     # Automated setup script
├── QUICKSTART.md               # Quick start guide
└── README.md                    # Main documentation
```

## Key Components

### Core Services

**OTP Service** (`src/services/otp.service.js`)
- Generates secure 6-digit OTPs
- Stores hashed OTPs in database + Redis cache
- Rate limiting (5 requests per 15 minutes)
- Attempt limiting (3 attempts per OTP)
- Automatic expiry (5 minutes default)

**Email Service** (`src/services/email/email.service.js`)
- Multi-provider support (Gmail, SendGrid, AWS SES, SMTP)
- Handlebars template engine
- Database tracking for all emails
- Automatic failover capability
- Health check for providers

**Push Service** (`src/services/push/push.service.js`)
- FCM for Android/Web
- APNs for iOS
- Device token management
- Multi-device support per user
- Delivery tracking

**Kafka Integration**
- Producer: Queues notification jobs
- Consumer: Processes jobs asynchronously
- Topics: email-notifications, push-notifications, otp-requests
- Retry logic and error handling

### Database Schema

**notifications** - All notification records
- Tracks email/push/SMS notifications
- Status: pending, sent, failed, cancelled
- Retry count and error messages

**otps** - Secure OTP storage
- Bcrypt-hashed OTPs (never plain text)
- Purpose-based (login, verification, reset_password)
- Expiry and attempt tracking

**notification_templates** - Reusable templates
- Handlebars syntax
- HTML and plain text variants
- Default data merging

**device_tokens** - Push notification devices
- Multi-platform support
- Active/inactive status
- Last used tracking

**audit_logs** - Complete audit trail
- All entity changes
- Actor attribution
- IP and user agent tracking

### API Endpoints

**OTP**
- `POST /api/v1/otp/request` - Generate and send OTP
- `POST /api/v1/otp/verify` - Validate OTP

**Email**
- `POST /api/v1/email/send` - Send email (templated or raw)
- `GET /api/v1/email/health` - Check provider status

**Push**
- `POST /api/v1/push/send` - Send push notification
- `POST /api/v1/push/device/register` - Register device token
- `POST /api/v1/push/device/unregister` - Remove device token

**Health**
- `GET /api/v1/health` - Service health check

### Infrastructure

**Docker Compose** - Local development
- PostgreSQL 15
- Redis 7
- Kafka + Zookeeper
- Application container

**Kubernetes** - Production deployment
- Namespace isolation
- ConfigMaps and Secrets
- Deployment with 3 replicas
- HPA (2-10 pods)
- LoadBalancer service
- Health checks (liveness/readiness)

### Security Features

- Non-root container user
- Bcrypt password hashing
- Rate limiting (Redis-backed)
- CORS configuration
- Helmet.js security headers
- Secrets management
- No sensitive data in logs

### Monitoring & Observability

- Winston structured logging
- Health check endpoints
- Prometheus metrics (ready to enable)
- Request/response logging
- Error tracking
- Audit logs for compliance

## Technology Stack

**Runtime:**
- Node.js 18+
- Express.js

**Database:**
- PostgreSQL 15+ (primary data store)
- Redis 6+ (caching, rate limiting)

**Message Queue:**
- Apache Kafka 2.8+ (async processing)

**Email Providers:**
- Nodemailer (Gmail, SMTP)
- SendGrid
- AWS SES

**Push Providers:**
- Firebase Admin SDK (FCM)
- node-apn (APNs)

**Tools & Libraries:**
- Knex.js (SQL query builder)
- ioredis (Redis client)
- KafkaJS (Kafka client)
- Handlebars (templating)
- Winston (logging)
- Jest (testing)
- Helmet (security)

## Environment Configuration

**Required:**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `DB_*` - PostgreSQL credentials
- `REDIS_*` - Redis connection
- `GMAIL_*` or `SENDGRID_*` - Email provider

**Optional:**
- `KAFKA_*` - Kafka configuration
- `FCM_*` - Firebase push notifications
- `APNS_*` - Apple push notifications
- `OTP_*` - OTP settings (has defaults)

## Development Workflow

1. **Setup**: Run `./setup.sh` or manually configure `.env`
2. **Develop**: Use `npm run dev` for hot-reload
3. **Test**: Run `npm test` for unit/integration tests
4. **Lint**: Run `npm run lint` for code quality
5. **Build**: Use `docker build` for containerization
6. **Deploy**: Apply k8s manifests or use docker-compose

## Production Considerations

**Scaling:**
- Horizontal: Add more pods/containers
- Database: Use read replicas
- Redis: Use Redis cluster
- Kafka: Multiple brokers with replication

**High Availability:**
- Multi-replica deployment (min 2)
- Database failover
- Redis sentinel/cluster
- Kafka with replication factor 3

**Performance:**
- Connection pooling (DB, Redis)
- Async processing via Kafka
- Caching strategy (Redis)
- Database indexing

**Security:**
- Secrets in external vault
- TLS/SSL everywhere
- Network policies
- RBAC in Kubernetes
- Regular security audits

## Extensibility

**Adding Email Providers:**
1. Create new provider in `src/services/email/providers/`
2. Implement `send()` and `verify()` methods
3. Register in `email.service.js`

**Adding Push Providers:**
1. Create provider in `src/services/push/providers/`
2. Implement `send()` method
3. Register in `push.service.js`

**Adding Templates:**
1. Insert into `notification_templates` table
2. Use Handlebars syntax
3. Reference by name in API calls

**Custom Notification Channels:**
1. Create new service (e.g., SMS)
2. Add controller and routes
3. Implement Kafka topics if needed
4. Add to main router
