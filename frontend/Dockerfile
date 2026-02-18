# Use Node 20 image
FROM node:20-slim

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5173

# Start preview server with host option
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
