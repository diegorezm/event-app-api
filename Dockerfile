# Use a specific version of Node.js on an Alpine-based image
FROM node:22.6.0-alpine3.20

# Create necessary directories and set permissions
RUN mkdir -p /home/node/app/node_modules && \
    chown -R node:node /home/node/app

# Set the working directory
WORKDIR /home/node/app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json) first
# This leverages Docker’s cache to avoid reinstalling packages on every build
COPY package*.json ./

# Switch to the non-root user
USER node

# Install dependencies
RUN npm ci

# Remove the src directory if it's not needed for production builds
RUN rm -rf src

# Copy the rest of the application code, maintaining permissions
COPY --chown=node:node . .

# Set environment variables with default values
ARG NODE_ENV=production
ARG PORT=8000
ENV NODE_ENV=${NODE_ENV} \
    PORT=${PORT}

# Expose the port that the app runs on
EXPOSE ${PORT}

# Start the application
CMD ["npm", "run", "start:prod"]
