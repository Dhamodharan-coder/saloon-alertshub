# Deployment Guide

## Local Development

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- Redis >= 6
- Kafka >= 2.8 (optional)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database:**
   ```bash
   npm run migrate:latest
   npm run seed:run
   ```

4. **Start the service:**
   ```bash
   npm run dev
   ```

---

## Docker Deployment

### Using Docker Compose (Recommended for Development)

The easiest way to run the entire stack:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Kafka on port 9092
- Zookeeper on port 2181
- Application on port 3000

### Build Docker Image

```bash
docker build -t saloon-alertshub:latest .
```

### Run Container

```bash
docker run -d \
  --name alertshub \
  -p 3000:3000 \
  -e DB_HOST=postgres \
  -e REDIS_HOST=redis \
  -e GMAIL_USER=your-email@gmail.com \
  -e GMAIL_APP_PASSWORD=your-password \
  saloon-alertshub:latest
```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Container registry access

### Step 1: Build and Push Image

```bash
# Build
docker build -t your-registry/saloon-alertshub:v1.0.0 .

# Push to registry
docker push your-registry/saloon-alertshub:v1.0.0
```

### Step 2: Update Image in Deployment

Edit `k8s/deployment.yaml`:

```yaml
spec:
  containers:
    - name: alertshub
      image: your-registry/saloon-alertshub:v1.0.0
```

### Step 3: Configure Secrets

Edit `k8s/configmap.yaml` and add your credentials:

```yaml
stringData:
  DB_PASSWORD: "your-secure-password"
  GMAIL_USER: "your-email@gmail.com"
  GMAIL_APP_PASSWORD: "your-app-password"
```

### Step 4: Deploy

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy config and secrets
kubectl apply -f k8s/configmap.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml

# Deploy autoscaler
kubectl apply -f k8s/hpa.yaml
```

### Step 5: Verify Deployment

```bash
# Check pods
kubectl get pods -n saloon-alertshub

# Check service
kubectl get svc -n saloon-alertshub

# View logs
kubectl logs -f deployment/alertshub-deployment -n saloon-alertshub

# Check HPA status
kubectl get hpa -n saloon-alertshub
```

### Step 6: Access the Service

```bash
# Get external IP (LoadBalancer)
kubectl get svc alertshub-service -n saloon-alertshub

# Port forward for testing
kubectl port-forward svc/alertshub-service 3000:80 -n saloon-alertshub
```

---

## Production Considerations

### Database

**Managed PostgreSQL:**
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, Azure Database)
- Enable automated backups
- Configure connection pooling
- Use read replicas for scaling

**Configuration:**
```env
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_DATABASE=saloon_alertshub
DB_USER=postgres
DB_PASSWORD=secure-password
```

### Redis

**Managed Redis:**
- Use managed Redis (AWS ElastiCache, Google Memorystore, Azure Cache)
- Enable persistence (AOF)
- Configure eviction policies

```env
REDIS_HOST=your-elasticache-endpoint
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### Kafka

**Managed Kafka:**
- Use managed Kafka (Confluent Cloud, AWS MSK, Azure Event Hubs)
- Configure appropriate retention policies
- Use SASL/SSL for authentication

```env
KAFKA_BROKERS=broker1:9092,broker2:9092,broker3:9092
KAFKA_SASL_MECHANISM=SCRAM-SHA-256
KAFKA_SASL_USERNAME=your-username
KAFKA_SASL_PASSWORD=your-password
```

### Environment Variables

**Critical Production Settings:**

```env
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_METRICS=true

# Security
JWT_SECRET=long-random-secret
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Monitoring

**Prometheus Metrics:**
- Application exposes metrics on port 9090
- Configure Prometheus to scrape metrics
- Set up Grafana dashboards

**Logging:**
- Use centralized logging (ELK, Splunk, Datadog)
- Configure log aggregation
- Set up alerts for errors

**Health Checks:**
- Liveness: `/api/v1/health`
- Readiness: `/api/v1/health`
- Email health: `/api/v1/email/health`

### Scaling

**Horizontal Pod Autoscaler:**
- Configured in `k8s/hpa.yaml`
- Scales based on CPU/Memory
- Min: 2 replicas, Max: 10 replicas

**Manual Scaling:**
```bash
kubectl scale deployment alertshub-deployment --replicas=5 -n saloon-alertshub
```

### Security

**Best Practices:**

1. **Secrets Management:**
   - Use Kubernetes Secrets or external secret managers (HashiCorp Vault, AWS Secrets Manager)
   - Rotate secrets regularly

2. **Network Policies:**
   - Restrict pod-to-pod communication
   - Use ingress controllers with TLS

3. **RBAC:**
   - Configure proper Kubernetes RBAC
   - Principle of least privilege

4. **Container Security:**
   - Run as non-root user (already configured)
   - Scan images for vulnerabilities
   - Use distroless or minimal base images

### Backup and Recovery

**Database Backups:**
```bash
# PostgreSQL backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_DATABASE > backup.sql

# Restore
psql -h $DB_HOST -U $DB_USER -d $DB_DATABASE < backup.sql
```

**Kubernetes Resources:**
```bash
# Backup all resources
kubectl get all -n saloon-alertshub -o yaml > k8s-backup.yaml
```

### CI/CD Pipeline

**Example GitHub Actions:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t ${{ secrets.REGISTRY }}/alertshub:${{ github.sha }} .
      
      - name: Push to registry
        run: docker push ${{ secrets.REGISTRY }}/alertshub:${{ github.sha }}
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/alertshub-deployment \
            alertshub=${{ secrets.REGISTRY }}/alertshub:${{ github.sha }} \
            -n saloon-alertshub
```

---

## Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check database connectivity
kubectl exec -it deployment/alertshub-deployment -n saloon-alertshub -- \
  nc -zv postgres-service 5432
```

**Kafka Connection Issues:**
```bash
# Check Kafka brokers
kubectl exec -it deployment/alertshub-deployment -n saloon-alertshub -- \
  nc -zv kafka-service 9092
```

**Pod Crashes:**
```bash
# View pod logs
kubectl logs deployment/alertshub-deployment -n saloon-alertshub --previous

# Describe pod for events
kubectl describe pod <pod-name> -n saloon-alertshub
```

### Performance Tuning

**Node.js:**
- Increase memory limit: `NODE_OPTIONS=--max-old-space-size=4096`
- Use cluster mode for multi-core utilization

**Database:**
- Tune connection pool size
- Add database indexes
- Optimize queries

**Redis:**
- Configure maxmemory policies
- Use appropriate data structures

---

## Rollback

### Kubernetes Rollback

```bash
# View rollout history
kubectl rollout history deployment/alertshub-deployment -n saloon-alertshub

# Rollback to previous version
kubectl rollout undo deployment/alertshub-deployment -n saloon-alertshub

# Rollback to specific revision
kubectl rollout undo deployment/alertshub-deployment --to-revision=2 -n saloon-alertshub
```

### Database Rollback

```bash
# Rollback last migration
npm run migrate:rollback
```
