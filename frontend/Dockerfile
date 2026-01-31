# Step 1: install dependencies and build
FROM node:22-alpine AS builder
# Create a workdir and install deps
WORKDIR /app
COPY package*.json ./
RUN npm install
# Copy source and build the app
COPY . .
RUN npm run build


# Step 2: set up the final image
FROM nginx:alpine AS final
# Copy build artifacts and nginx config
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/src/assets /usr/share/nginx/html/assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port, set healthcheck, and upon container start
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health
CMD ["nginx", "-g", "daemon off;"]