# ============================================
# Origem Viva API - Dockerfile
# ============================================

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install since no lock file)
RUN npm install --omit=dev

# Copy source
COPY . .

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]
