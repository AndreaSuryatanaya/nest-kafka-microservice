# Base image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nx build api-gateway --prod

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/api-gateway ./dist

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
