# Troubleshooting Guide

Common issues and their solutions for Saloon AlertsHub.

## Installation Issues

### npm install fails

**Problem:** Package installation errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Node version mismatch

**Problem:** "Requires Node.js >= 18.0.0"

**Solution:**
```bash
# Check your Node version
node --version

# Install nvm and use Node 18
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

## Database Issues

### Cannot connect to PostgreSQL

**Problem:** "❌ Database connection failed"

**Solutions:**

1. **Check if PostgreSQL is running:**
```bash
sudo systemctl status postgresql
# or
pg_isready -h localhost -p 5432
```

2. **Start PostgreSQL:**
```bash
sudo systemctl start postgresql
```

3. **Verify credentials in .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=saloon_alertshub
DB_USER=postgres
DB_PASSWORD=your_password
```

4. **Create database if it doesn't exist:**
```bash
psql -h localhost -U postgres -c "CREATE DATABASE saloon_alertshub;"
```

5. **Check firewall:**
```bash
sudo ufw allow 5432/tcp
```

### Migration fails

**Problem:** "Migration failed" or "Table already exists"

**Solutions:**

1. **Rollback and re-run:**
```bash
npm run migrate:rollback
npm run migrate:latest
```

2. **Check migration status:**
```bash
npx knex migrate:status
```

3. **Reset database (CAUTION - deletes all data):**
```bash
npm run migrate:rollback --all
npm run migrate:latest
npm run seed:run
```

### Connection pool exhausted

**Problem:** "Timeout acquiring a connection"

**Solution:**
```javascript
// In knexfile.js, increase pool size:
pool: {
  min: 2,
  max: 20,  // Increase this
}
```

## Redis Issues

### Cannot connect to Redis

**Problem:** "❌ Redis connection error"

**Solutions:**

1. **Check if Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

2. **Start Redis:**
```bash
# Ubuntu/Debian
sudo systemctl start redis-server

# macOS
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

3. **Verify Redis connection:**
```bash
redis-cli -h localhost -p 6379
# Try: PING
```

4. **Check .env configuration:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave empty if no password
```

### Redis memory issues

**Problem:** "OOM command not allowed"

**Solution:**
```bash
# Connect to Redis
redis-cli

# Check memory
INFO memory

# Set eviction policy
CONFIG SET maxmemory-policy allkeys-lru

# Or in redis.conf:
maxmemory 256mb
maxmemory-policy allkeys-lru
```

## Kafka Issues

### Kafka connection timeout

**Problem:** "❌ Failed to initialize Kafka"

**Solutions:**

1. **Kafka is optional - disable it:**
```javascript
// Set useKafka: false in API requests
{
  "identifier": "user@example.com",
  "purpose": "login",
  "useKafka": false  // Synchronous processing
}
```

2. **Start Kafka with Docker:**
```bash
docker-compose up -d kafka zookeeper
```

3. **Check Kafka brokers:**
```env
KAFKA_BROKERS=localhost:9092
```

4. **Verify Kafka is running:**
```bash
# Check if Kafka is listening
nc -zv localhost 9092

# List topics
docker exec -it saloon-alertshub-kafka kafka-topics --list --bootstrap-server localhost:9092
```

### Consumer group errors

**Problem:** "Group coordinator not available"

**Solution:**
```bash
# Reset consumer group
docker exec -it saloon-alertshub-kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group notification-service \
  --reset-offsets --to-earliest --execute --all-topics
```

## Email Issues

### Gmail authentication failed

**Problem:** "Invalid login" or "Username and Password not accepted"

**Solutions:**

1. **Use App Password, not regular password:**
   - Go to https://myaccount.google.com/apppasswords
   - Enable 2-Factor Authentication first
   - Create a new App Password
   - Use the 16-character password in .env

2. **Check .env:**
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop  # 16 characters from Google
```

3. **Allow less secure apps (not recommended):**
   - Not needed if using App Password

### Email not being sent

**Problem:** Email reports "sent" but not received

**Solutions:**

1. **Check spam folder**

2. **View logs:**
```bash
# Development
npm run dev

# Docker
docker-compose logs -f app
```

3. **Test email provider:**
```bash
curl http://localhost:3000/api/v1/email/health
```

4. **Send test email:**
```bash
curl -X POST http://localhost:3000/api/v1/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test",
    "text": "Test email"
  }'
```

5. **Check email quota:**
   - Gmail free: 500 emails/day
   - Consider using SendGrid for higher volume

### SendGrid setup

**Problem:** Want to use SendGrid instead of Gmail

**Solution:**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

## OTP Issues

### OTP not received

**Problem:** OTP request succeeds but no email

**Solutions:**

1. **Check logs - OTP is logged in development:**
```bash
npm run dev
# Look for: "OTP created for user@example.com: 123456"
```

2. **Query database directly:**
```sql
SELECT * FROM otps 
WHERE identifier = 'user@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

3. **Check email provider logs**

### OTP verification fails

**Problem:** "Invalid OTP" even with correct code

**Solutions:**

1. **Check expiry:**
   - Default: 5 minutes
   - Verify OTP hasn't expired

2. **Check attempts:**
   - Max 3 attempts per OTP
   - Request new OTP if exceeded

3. **Verify identifier matches:**
```bash
# Request and verify must use same identifier
{
  "identifier": "user@example.com",  # Must match exactly
  "otp": "123456",
  "purpose": "login"  # Must match purpose used in request
}
```

4. **Check database:**
```sql
SELECT identifier, purpose, status, attempts, expires_at 
FROM otps 
WHERE identifier = 'user@example.com' 
ORDER BY created_at DESC;
```

### Rate limit exceeded

**Problem:** "Rate limit exceeded. Try again in X minutes"

**Solutions:**

1. **Wait for the specified time**

2. **Clear Redis cache (development only):**
```bash
redis-cli
FLUSHALL
```

3. **Adjust rate limits in .env:**
```env
OTP_RATE_LIMIT_WINDOW_MINUTES=15  # Increase this
OTP_RATE_LIMIT_MAX_REQUESTS=5     # Or increase this
```

## Push Notification Issues

### FCM not working

**Problem:** "FCM provider not initialized"

**Solution:**
```bash
# 1. Download service account JSON from Firebase Console
# 2. Save as config/firebase-service-account.json
# 3. Update .env:
FCM_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

### APNs errors

**Problem:** "APNs provider not initialized"

**Solution:**
```bash
# 1. Download .p8 key from Apple Developer
# 2. Save as config/apns-key.p8
# 3. Update .env:
APNS_KEY_PATH=./config/apns-key.p8
APNS_KEY_ID=your-key-id
APNS_TEAM_ID=your-team-id
APNS_BUNDLE_ID=com.yourapp.bundle
APNS_PRODUCTION=false  # true for production
```

### No device tokens found

**Problem:** "No device tokens found for user"

**Solution:**
```bash
# Register device token first:
curl -X POST http://localhost:3000/api/v1/push/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "token": "device-token-from-app",
    "platform": "ios"
  }'
```

## Docker Issues

### Docker Compose fails

**Problem:** "Error starting container"

**Solutions:**

1. **Check if ports are already in use:**
```bash
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :6379  # Redis
sudo lsof -i :9092  # Kafka
sudo lsof -i :3000  # App
```

2. **Stop conflicting services:**
```bash
sudo systemctl stop postgresql
sudo systemctl stop redis
```

3. **Rebuild containers:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

4. **View logs:**
```bash
docker-compose logs -f
```

### Container keeps restarting

**Problem:** Container exits immediately

**Solutions:**

1. **Check logs:**
```bash
docker-compose logs app
```

2. **Common causes:**
   - Database not ready (wait ~30 seconds)
   - Missing environment variables
   - Port conflicts

3. **Check environment:**
```bash
docker-compose exec app env | grep DB_
```

## API Issues

### 404 Not Found

**Problem:** "Cannot GET /api/v1/..."

**Solution:**
```bash
# Verify correct URL:
http://localhost:3000/api/v1/health  # ✓ Correct
http://localhost:3000/health         # ✗ Wrong
```

### CORS errors

**Problem:** "Access blocked by CORS policy"

**Solution:**
```env
# Add your frontend URL to .env:
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

### 500 Internal Server Error

**Problem:** Generic error response

**Solutions:**

1. **Check logs:**
```bash
# Development
npm run dev

# Production
cat logs/error.log
```

2. **Enable verbose logging:**
```env
LOG_LEVEL=debug
```

3. **Test with curl:**
```bash
curl -v http://localhost:3000/api/v1/health
```

## Performance Issues

### Slow response times

**Solutions:**

1. **Check database indexes:**
```sql
-- Already indexed in migrations, but verify:
\d notifications
\d otps
```

2. **Increase connection pool:**
```env
# In knexfile.js
pool: {
  min: 5,
  max: 30
}
```

3. **Use Redis caching more:**
   - OTP validation uses Redis
   - Consider caching templates

4. **Enable Kafka for async:**
```json
{
  "useKafka": true
}
```

### High memory usage

**Solutions:**

1. **Limit Node.js memory:**
```bash
NODE_OPTIONS=--max-old-space-size=512 npm start
```

2. **Check for memory leaks:**
```bash
node --inspect src/index.js
# Use Chrome DevTools to profile
```

3. **Clean up old data:**
```sql
-- Archive old notifications
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';

-- Clean expired OTPs
DELETE FROM otps WHERE status = 'expired';
```

## Kubernetes Issues

### Pods not starting

**Problem:** Pods in CrashLoopBackOff

**Solutions:**

1. **Check pod logs:**
```bash
kubectl logs -f deployment/alertshub-deployment -n saloon-alertshub
```

2. **Describe pod:**
```bash
kubectl describe pod <pod-name> -n saloon-alertshub
```

3. **Check secrets:**
```bash
kubectl get secret alertshub-secrets -n saloon-alertshub -o yaml
```

4. **Verify image:**
```bash
kubectl get pods -n saloon-alertshub -o jsonpath='{.items[0].spec.containers[0].image}'
```

### Service not accessible

**Problem:** Can't reach the service

**Solutions:**

1. **Check service:**
```bash
kubectl get svc alertshub-service -n saloon-alertshub
```

2. **Port forward for testing:**
```bash
kubectl port-forward svc/alertshub-service 3000:80 -n saloon-alertshub
```

3. **Check ingress (if used):**
```bash
kubectl get ingress -n saloon-alertshub
```

## Getting Help

### Enable Debug Logging

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Check Health Endpoints

```bash
# Service health
curl http://localhost:3000/api/v1/health

# Email providers
curl http://localhost:3000/api/v1/email/health
```

### Database Queries for Debugging

```sql
-- Check recent notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Check active OTPs
SELECT * FROM otps WHERE status = 'active';

-- Check email templates
SELECT name, type, is_active FROM notification_templates;

-- Check device tokens
SELECT user_id, platform, is_active FROM device_tokens;

-- Check recent audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

### Useful Commands

```bash
# View all logs
tail -f logs/*.log

# Check all running processes
ps aux | grep node

# Check network connections
netstat -tlnp | grep :3000

# Test database connection
psql -h localhost -U postgres -d saloon_alertshub -c "SELECT 1;"

# Test Redis
redis-cli -h localhost -p 6379 ping

# Check Kafka topics
docker exec saloon-alertshub-kafka kafka-topics --list --bootstrap-server localhost:9092
```

## Still Having Issues?

1. Check the documentation:
   - README.md
   - docs/API.md
   - docs/DEPLOYMENT.md

2. Review error logs carefully

3. Enable debug logging

4. Test each component individually

5. Use the Postman collection to test APIs

6. Check GitHub issues (if applicable)
