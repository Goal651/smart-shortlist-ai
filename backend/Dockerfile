# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only-production

# Copy built assets from builder
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist

# Switch to non-root user
USER nodeuser

# The backend runs on port 5000
EXPOSE 5000

# Start the application
CMD [ "node", "dist/index.js" ]