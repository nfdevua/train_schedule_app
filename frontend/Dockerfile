FROM node:22-alpine


# Set the working directory inside the container
WORKDIR /app

# Copy the rest of the application files


COPY . .

RUN npm install
RUN npm run build

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start"]
