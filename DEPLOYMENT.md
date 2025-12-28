# NestJS Kafka Microservices - Digital Ocean Deployment Guide

## Prerequisites

1. Digital Ocean Droplet (minimum 2GB RAM, 2 vCPU)
2. Docker & Docker Compose installed
3. Domain name (optional, for SSL)

## Quick Deployment

### 1. SSH ke Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

### 2. Install Docker (jika belum)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose-plugin -y
```

### 3. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/nestjs-kafka.git
cd nestjs-kafka
```

### 4. Setup Environment

```bash
cp .env.example .env
# Edit .env jika diperlukan
nano .env
```

### 5. Deploy

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## Manual Deployment

### Build & Run

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

## Useful Commands

```bash
# View all logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f api-gateway

# Restart all services
docker compose -f docker-compose.prod.yml restart

# Stop all services
docker compose -f docker-compose.prod.yml down

# Rebuild specific service
docker compose -f docker-compose.prod.yml build api-gateway
docker compose -f docker-compose.prod.yml up -d api-gateway
```

## API Endpoints

Base URL: `http://YOUR_DROPLET_IP/api`

| Endpoint             | Method | Auth | Description       |
| -------------------- | ------ | ---- | ----------------- |
| `/api/auth/register` | POST   | ❌   | Register user     |
| `/api/auth/login`    | POST   | ❌   | Login & get token |
| `/api/auth/profile`  | GET    | ✅   | Get user profile  |
| `/api/order`         | POST   | ✅   | Create order      |

## Testing

```bash
# Register
curl -X POST http://YOUR_DROPLET_IP/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "123456", "name": "Test"}'

# Login
curl -X POST http://YOUR_DROPLET_IP/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "123456"}'

# Create Order (dengan token)
curl -X POST http://YOUR_DROPLET_IP/api/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"product": "Laptop", "quantity": 1}'
```

## SSL Setup (Optional)

### Using Certbot

```bash
# Install certbot
apt install certbot -y

# Get certificate
certbot certonly --standalone -d your-domain.com

# Copy certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/

# Update nginx.conf to enable HTTPS
# Uncomment the HTTPS server block in nginx/nginx.conf

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

## Monitoring

### Check Service Health

```bash
curl http://YOUR_DROPLET_IP/health
```

### View Resource Usage

```bash
docker stats
```

## Troubleshooting

### Kafka Connection Issues

```bash
# Check Kafka logs
docker compose -f docker-compose.prod.yml logs kafka

# Restart Kafka
docker compose -f docker-compose.prod.yml restart kafka
```

### Service Not Responding

```bash
# Check service logs
docker compose -f docker-compose.prod.yml logs api-gateway

# Restart service
docker compose -f docker-compose.prod.yml restart api-gateway
```

### Out of Memory

```bash
# Check memory usage
free -h

# Increase swap (if needed)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```
