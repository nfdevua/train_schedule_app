# Docker Compose Management Commands
.PHONY: up down restart logs clean build rebuild status

# Start all services
up:
	@echo "🚀 Starting all services..."
	docker compose up -d

# Start all services with build
up-build:
	@echo "🔨 Building and starting all services..."
	docker compose up --build -d

# Build all images
build:
	@echo "🔨 Building all Docker images..."
	docker compose build

# Build specific images
build-backend:
	@echo "🔨 Building backend image..."
	docker compose build backend

build-frontend:
	@echo "🔨 Building frontend image..."
	docker compose build frontend

# Build images without cache
build-no-cache:
	@echo "🔨 Building all images without cache..."
	docker compose build --no-cache

build-backend-no-cache:
	@echo "🔨 Building backend image without cache..."
	docker compose build --no-cache backend

build-frontend-no-cache:
	@echo "🔨 Building frontend image without cache..."
	docker compose build --no-cache frontend

# Stop all services
down:
	@echo "🛑 Stopping all services..."
	docker compose down

# Stop and remove all containers, networks, and volumes
clean:
	@echo "🧹 Cleaning up all containers, networks, and volumes..."
	docker compose down -v --remove-orphans
	docker system prune -f

# Remove all containers and images
remove-all:
	@echo "🗑️  Removing all containers and images..."
	docker compose down --rmi all -v --remove-orphans
	docker system prune -af

# Restart all services
restart:
	@echo "🔄 Restarting all services..."
	docker compose restart

# View logs for all services
logs:
	@echo "📋 Showing logs for all services..."
	docker compose logs -f

# View logs for specific service
logs-backend:
	@echo "📋 Showing backend logs..."
	docker compose logs -f backend

logs-frontend:
	@echo "📋 Showing frontend logs..."
	docker compose logs -f frontend

logs-db:
	@echo "📋 Showing database logs..."
	docker compose logs -f postgres redis

# Show status of all services
status:
	@echo "📊 Service status:"
	docker compose ps

# Backend specific commands
.PHONY: backend-up backend-down backend-logs backend-shell backend-rebuild backend-build

backend-up:
	@echo "🚀 Starting backend service..."
	docker compose up -d backend postgres redis

backend-down:
	@echo "🛑 Stopping backend service..."
	docker compose stop backend

backend-logs:
	@echo "📋 Showing backend logs..."
	docker compose logs -f backend

backend-shell:
	@echo "🐚 Opening backend shell..."
	docker compose exec backend sh

backend-rebuild:
	@echo "🔨 Rebuilding backend service..."
	docker compose up --build -d backend

backend-build:
	@echo "🔨 Building backend image only..."
	docker compose build backend

# Frontend specific commands
.PHONY: frontend-up frontend-down frontend-logs frontend-shell frontend-rebuild frontend-build

frontend-up:
	@echo "🚀 Starting frontend service..."
	docker compose up -d frontend backend postgres redis

frontend-down:
	@echo "🛑 Stopping frontend service..."
	docker compose stop frontend

frontend-logs:
	@echo "📋 Showing frontend logs..."
	docker compose logs -f frontend

frontend-shell:
	@echo "🐚 Opening frontend shell..."
	docker compose exec frontend sh

frontend-rebuild:
	@echo "🔨 Rebuilding frontend service..."
	docker compose up --build -d frontend

frontend-build:
	@echo "🔨 Building frontend image only..."
	docker compose build frontend

# Database specific commands
.PHONY: db-up db-down db-logs db-shell db-reset

db-up:
	@echo "🚀 Starting database services..."
	docker compose up -d postgres redis

db-down:
	@echo "🛑 Stopping database services..."
	docker compose stop postgres redis

db-logs:
	@echo "📋 Showing database logs..."
	docker compose logs -f postgres redis

db-shell:
	@echo "🐚 Opening PostgreSQL shell..."
	docker compose exec postgres psql -U postgres -d train_schedule

db-reset:
	@echo "🔄 Resetting database..."
	docker compose down -v
	docker compose up -d postgres redis

# Development commands
.PHONY: dev dev-backend dev-frontend

dev:
	@echo "🛠️  Starting development environment..."
	docker compose up -d postgres redis
	@echo "📝 Run 'make dev-backend' and 'make dev-frontend' in separate terminals"

dev-backend:
	@echo "🛠️  Starting backend in development mode..."
	cd backend/train-schedule-backend && npm run start:dev

dev-frontend:
	@echo "🛠️  Starting frontend in development mode..."
	cd frontend && npm start

# Help command
help:
	@echo "📚 Available commands:"
	@echo ""
	@echo "🚀 General Commands:"
	@echo "  make up          - Start all services"
	@echo "  make up-build    - Build and start all services"
	@echo "  make build       - Build all Docker images"
	@echo "  make build-no-cache - Build all images without cache"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs for all services"
	@echo "  make status      - Show service status"
	@echo "  make clean       - Stop and remove containers, networks, volumes"
	@echo "  make remove-all  - Remove all containers and images"
	@echo ""
	@echo "🔧 Backend Commands:"
	@echo "  make backend-up      - Start backend service"
	@echo "  make backend-down    - Stop backend service"
	@echo "  make backend-build   - Build backend image only"
	@echo "  make backend-logs    - View backend logs"
	@echo "  make backend-shell   - Open backend shell"
	@echo "  make backend-rebuild - Rebuild backend service"
	@echo ""
	@echo "🎨 Frontend Commands:"
	@echo "  make frontend-up      - Start frontend service"
	@echo "  make frontend-down    - Stop frontend service"
	@echo "  make frontend-build   - Build frontend image only"
	@echo "  make frontend-logs    - View frontend logs"
	@echo "  make frontend-shell   - Open frontend shell"
	@echo "  make frontend-rebuild - Rebuild frontend service"
	@echo ""
	@echo "🗄️  Database Commands:"
	@echo "  make db-up     - Start database services"
	@echo "  make db-down   - Stop database services"
	@echo "  make db-logs   - View database logs"
	@echo "  make db-shell  - Open PostgreSQL shell"
	@echo "  make db-reset  - Reset database"
	@echo ""
	@echo "🛠️  Development Commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-backend  - Start backend in dev mode"
	@echo "  make dev-frontend - Start frontend in dev mode"