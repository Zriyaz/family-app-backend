FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY src ./src

# Build TypeScript
RUN npm run build

# Remove dev dependencies and source files
RUN npm prune --production
RUN rm -rf src tsconfig.json

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "dist/server.js"]

