# Frontend Dockerfile - Multi-stage build for React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including optional deps for Alpine Linux)
RUN rm -rf node_modules package-lock.json && npm install --include=optional

# Copy source code
COPY . .

# Build-time env vars
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# Runtime: nginx to serve static files
FROM nginx:1.25-alpine AS runtime

# Custom nginx config
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
