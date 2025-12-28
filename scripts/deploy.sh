#!/bin/bash

# ===========================================
# Deploy Script for NestJS Kafka Microservices
# ===========================================

set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Build and start all containers
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start containers
echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check container status
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo "📜 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=50

echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your API at: http://YOUR_DROPLET_IP/api"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Restart: docker-compose -f docker-compose.prod.yml restart"
echo "  - Stop: docker-compose -f docker-compose.prod.yml down"
