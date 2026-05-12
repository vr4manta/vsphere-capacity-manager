# Multi-stage Dockerfile for OpenShift Console Dynamic Plugin

# Stage 1: Build the plugin
FROM registry.access.redhat.com/ubi9/nodejs-22:latest AS builder

USER root

# Set working directory
WORKDIR /app

# Copy package files
COPY console-plugin/package.json console-plugin/yarn.lock ./

# Install yarn
RUN npm install -g yarn

# Install dependencies
RUN yarn install

# Copy source code
COPY console-plugin/ ./

# Build the plugin
RUN yarn build

# Stage 2: Serve with nginx
FROM registry.access.redhat.com/ubi9/nginx-120:latest

# Copy built assets from builder (includes plugin-manifest.json and plugin-entry.js)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY console-plugin/nginx.conf /etc/nginx/nginx.conf

# Copy localization files
COPY console-plugin/locales /usr/share/nginx/html/locales

# Expose port 9443 for HTTPS
EXPOSE 9443

# Run nginx
USER 1001
CMD ["nginx", "-g", "daemon off;"]
