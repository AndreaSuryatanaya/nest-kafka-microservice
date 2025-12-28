# Base image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Build stage
FROM base AS builder
COPY package*.json ./
COPY nx.json tsconfig*.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm ci
RUN npx nx build user-microservice --prod

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy production dependencies and built app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/user-microservice ./dist

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main.js"]
