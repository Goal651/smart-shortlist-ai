# ============================================
# Stage 1: Build Backend
# ============================================
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# ============================================
# Stage 2: Build Frontend
# ============================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
# We need to set production for Next.js build
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build

# ============================================
# Stage 3: Final Monolithic Image
# ============================================
FROM node:18-alpine AS runner
WORKDIR /app

# Install root dependencies (for the proxy)
COPY package.json ./
RUN npm install --only-production

# Copy proxy script
COPY proxy.js ./

# Copy Backend built files
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy Frontend built files (Standalone mode)
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static

# Set environment variables
ENV NODE_ENV=production
# Render provides the PORT variable
EXPOSE 10000

# Start the monolithic proxy
CMD ["node", "proxy.js"]
