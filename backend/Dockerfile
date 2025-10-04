# Use Node.js 18 Alpine as base image
FROM node:22-alpine


# Set the working directory inside the container
WORKDIR /app

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm install
RUN npm run build

# Expose the application port
EXPOSE 3000


# Start the application
CMD ["npm", "run", "start:dev"]
# CMD ["npm", "run", "start:prod"]
