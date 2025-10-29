# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source code and build
COPY . .

# Build the application (uses .env variables at build time)
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install only vite for preview server (minimal dependencies)
RUN npm install -g vite@latest

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Use vite preview to serve the built files
CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
