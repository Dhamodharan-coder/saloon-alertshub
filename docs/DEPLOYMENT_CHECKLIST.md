# Deployment Checklist

Use this checklist to ensure all steps are completed before deploying to production.

## Pre-Deployment

### Environment Setup
- [ ] Create `.env` file from `.env.example`
- [ ] Update all database credentials
- [ ] Set strong passwords for DB_PASSWORD
- [ ] Configure email provider credentials
- [ ] Set up Firebase service account (if using FCM)
- [ ] Set up APNs keys (if using Apple push)
- [ ] Configure Kafka brokers (if using async processing)
- [ ] Set Redis credentials
- [ ] Update `ALLOWED_ORIGINS` for your frontend domains
- [ ] Set `NODE_ENV=production`

### Email Provider Setup
- [ ] Gmail: Enable 2FA and create App Password
- [ ] SendGrid: Create API key with mail send permissions
- [ ] Test email sending in development
- [ ] Verify SPF/DKIM records for your domain

### Push Notification Setup
- [ ] Firebase: Download service account JSON
- [ ] Place service account in `config/firebase-service-account.json`
- [ ] Apple: Download APNs auth key (.p8)
- [ ] Place APNs key in `config/apns-key.p8`
- [ ] Test push notifications on both platforms

### Database Setup
- [ ] Create production database
- [ ] Run migrations: `npm run migrate:latest`
- [ ] Seed templates: `npm run seed:run`
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Create read replicas (if needed)
- [ ] Set up database monitoring

### Redis Setup
- [ ] Provision Redis instance
- [ ] Enable persistence (AOF or RDB)
- [ ] Configure maxmemory policy
- [ ] Set up Redis monitoring
- [ ] Test connection

### Kafka Setup (Optional)
- [ ] Provision Kafka cluster
- [ ] Create required topics:
  - email-notifications
  - push-notifications
  - otp-requests
- [ ] Configure retention policies
- [ ] Set up monitoring
- [ ] Test producer/consumer

## Code Quality

### Testing
- [ ] Run all unit tests: `npm test`
- [ ] Run integration tests: `npm run test:integration`
- [ ] Achieve >80% code coverage
- [ ] Test OTP flow end-to-end
- [ ] Test email sending
- [ ] Test push notifications
- [ ] Test rate limiting
- [ ] Test error scenarios

### Code Review
- [ ] Run linter: `npm run lint`
- [ ] Fix all linting errors
- [ ] Review security best practices
- [ ] Check for hardcoded credentials
- [ ] Verify no sensitive data in logs
- [ ] Review error handling

### Documentation
- [ ] Update README.md with any customizations
- [ ] Document any custom templates added
- [ ] Document API changes
- [ ] Update environment variable documentation
- [ ] Create runbooks for common operations

## Docker Deployment

### Build
- [ ] Build Docker image: `docker build -t saloon-alertshub:v1.0.0 .`
- [ ] Test image locally
- [ ] Scan for vulnerabilities
- [ ] Tag with version number
- [ ] Push to container registry

### Docker Compose
- [ ] Update `docker-compose.yml` with production settings
- [ ] Configure volumes for persistence
- [ ] Set resource limits
- [ ] Test full stack with `docker-compose up`
- [ ] Verify all services healthy

## Kubernetes Deployment

### Pre-requisites
- [ ] Kubernetes cluster provisioned
- [ ] kubectl configured
- [ ] Container registry access configured
- [ ] Ingress controller installed (if needed)
- [ ] Cert-manager for TLS (if needed)

### Configuration
- [ ] Update `k8s/configmap.yaml` with production values
- [ ] Update `k8s/configmap.yaml` secrets with real credentials
- [ ] Update image reference in `k8s/deployment.yaml`
- [ ] Configure resource requests/limits
- [ ] Set up persistent volumes (if needed)
- [ ] Configure ingress rules

### Deployment
- [ ] Create namespace: `kubectl apply -f k8s/namespace.yaml`
- [ ] Apply configmap: `kubectl apply -f k8s/configmap.yaml`
- [ ] Deploy application: `kubectl apply -f k8s/deployment.yaml`
- [ ] Apply HPA: `kubectl apply -f k8s/hpa.yaml`
- [ ] Verify pods running: `kubectl get pods -n saloon-alertshub`
- [ ] Check logs: `kubectl logs -f deployment/alertshub-deployment -n saloon-alertshub`
- [ ] Test health endpoint
- [ ] Test all API endpoints

## Security

### Authentication & Authorization
- [ ] Implement API key authentication
- [ ] Set up JWT for user sessions (if needed)
- [ ] Configure CORS properly
- [ ] Review and restrict API access

### Secrets Management
- [ ] Remove secrets from code
- [ ] Use Kubernetes Secrets or external vault
- [ ] Enable secret rotation
- [ ] Audit secret access

### Network Security
- [ ] Configure network policies
- [ ] Enable TLS/SSL
- [ ] Set up firewall rules
- [ ] Restrict database access
- [ ] Use VPC/private networks

### Compliance
- [ ] Enable audit logging
- [ ] Set up log retention policies
- [ ] Implement GDPR requirements (if applicable)
- [ ] Document data retention policies

## Monitoring & Logging

### Logging
- [ ] Configure centralized logging
- [ ] Set up log aggregation
- [ ] Create log dashboards
- [ ] Set up error alerting
- [ ] Test log collection

### Monitoring
- [ ] Set up application monitoring
- [ ] Configure health checks
- [ ] Create performance dashboards
- [ ] Set up uptime monitoring
- [ ] Configure alerting rules

### Metrics
- [ ] Enable Prometheus metrics
- [ ] Set up Grafana dashboards
- [ ] Monitor key metrics:
  - Request rate
  - Error rate
  - Response time
  - OTP success rate
  - Email delivery rate
  - Push notification delivery rate

### Alerting
- [ ] Set up on-call rotation
- [ ] Configure PagerDuty/OpsGenie
- [ ] Create alert channels (Slack, email)
- [ ] Test alerting system
- [ ] Document escalation procedures

## Performance

### Optimization
- [ ] Enable connection pooling
- [ ] Configure caching strategy
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Enable gzip compression

### Load Testing
- [ ] Perform load testing
- [ ] Test rate limiting
- [ ] Verify auto-scaling
- [ ] Test failover scenarios
- [ ] Document performance benchmarks

## Backup & Recovery

### Backups
- [ ] Enable automated database backups
- [ ] Test backup restoration
- [ ] Document backup schedule
- [ ] Set up backup monitoring
- [ ] Configure backup retention

### Disaster Recovery
- [ ] Create disaster recovery plan
- [ ] Document recovery procedures
- [ ] Test recovery process
- [ ] Set RTO/RPO objectives
- [ ] Create runbooks

## Post-Deployment

### Validation
- [ ] Test all API endpoints in production
- [ ] Send test OTP
- [ ] Send test email
- [ ] Send test push notification
- [ ] Verify database persistence
- [ ] Check Kafka processing (if enabled)

### Monitoring
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify auto-scaling
- [ ] Review logs
- [ ] Test alerting

### Documentation
- [ ] Update deployment documentation
- [ ] Document production URLs
- [ ] Create operational runbooks
- [ ] Document troubleshooting procedures
- [ ] Share with team

### Communication
- [ ] Notify stakeholders of deployment
- [ ] Share API documentation
- [ ] Provide Postman collection
- [ ] Schedule knowledge transfer session
- [ ] Document known issues

## Maintenance

### Regular Tasks
- [ ] Schedule dependency updates
- [ ] Plan security patches
- [ ] Review logs weekly
- [ ] Monitor costs
- [ ] Review performance metrics

### Optimization
- [ ] Review and optimize slow queries
- [ ] Clean up old notification records
- [ ] Archive audit logs
- [ ] Optimize Kafka topics
- [ ] Review and update templates

## Rollback Plan

### Preparation
- [ ] Document current version
- [ ] Save database snapshot
- [ ] Keep previous Docker images
- [ ] Document rollback procedure

### Rollback Steps
- [ ] Scale down new deployment
- [ ] Deploy previous version
- [ ] Restore database if needed
- [ ] Verify service health
- [ ] Notify stakeholders

---

## Sign-off

### Development Team
- [ ] Developed by: _________________ Date: _________
- [ ] Code reviewed by: _____________ Date: _________
- [ ] Tested by: ___________________ Date: _________

### Operations Team
- [ ] Infrastructure ready: _________ Date: _________
- [ ] Monitoring configured: _______ Date: _________
- [ ] Backups verified: ____________ Date: _________

### Security Team
- [ ] Security review: _____________ Date: _________
- [ ] Secrets configured: __________ Date: _________
- [ ] Compliance verified: _________ Date: _________

### Stakeholders
- [ ] Product owner approval: ______ Date: _________
- [ ] Go-live approval: ____________ Date: _________

---

**Deployment Date:** _________________

**Deployment Version:** v1.0.0

**Deployed By:** _________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
