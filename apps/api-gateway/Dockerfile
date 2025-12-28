# Build stage
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy all project files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY apps ./apps
COPY packages ./packages

# Install dependencies
RUN npm ci

# Build the app
RUN npx nx reset
RUN npx nx build api-gateway --skip-nx-cache

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built application and dependencies
COPY --from=builder /app/dist/apps/api-gateway ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]
