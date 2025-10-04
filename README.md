# Train Schedule App

Web application for managing train schedules with admin panel and user interface.

## 🚀 Technologies

### Backend

- **NestJS** - Node.js framework
- **TypeORM** - ORM for database operations
- **PostgreSQL** - main database
- **Redis** - caching
- **JWT** - authentication
- **Docker** - containerization

### Frontend

- **React 19** - UI library
- **TypeScript** - type safety
- **React Router** - routing
- **Axios** - HTTP client
- **CSS Modules** - styling

## 📋 Prerequisites

- **Docker** and **Docker Compose** (recommended)
- **Node.js** 18+ (for local development)
- **Make** (optional, for convenience)

## 🚀 Quick Start

### Option 1: Using Make (Recommended)

```bash
# Build and start all services
make up-build

# Check service status
make status
```

### Option 2: Using Docker Compose

```bash
# Build and start all services
docker compose up --build -d

# Check service status
docker compose ps
```

### Option 3: Local Development

```bash
# Install backend dependencies
cd backend
npm install

# In a new terminal, install frontend dependencies
cd ../frontend
npm install

cd ..

make build up
# or
docker compose build
docker compose up
```

## 🌐 Application Access

After successful startup, the application will be available at:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Swagger** http://localhost:3000/api
- **PostgreSQL Admin**: http://localhost:8080
  - Email: `pgadmin@pgadmin.org`
  - Password: `postgres123`

## 👤 Test Accounts

- **Administrator**:

  - Username: `admin`
  - Password: `admin12`

- **User**:
  - Username: `user`
  - Password: `user12`

## 🛠️ Project Management

### Main Make Commands

```bash
# Start and stop
make up              # Start all services
make up-build        # Build and start all services
make down            # Stop all services
make restart         # Restart all services

# Build
make build           # Build all images
make build-no-cache  # Build without cache

# Logs and monitoring
make logs            # Show logs for all services
make logs-backend    # Show backend logs
make logs-frontend   # Show frontend logs
make status          # Show service status

# Cleanup
make clean           # Stop and remove containers, networks, volumes
make remove-all      # Remove all containers and images
```

### Development Commands

```bash
# Development mode
make dev             # Start databases for development
make dev-backend     # Start backend in dev mode
make dev-frontend    # Start frontend in dev mode

# Individual services
make backend-up      # Start only backend
make frontend-up     # Start only frontend
make db-up           # Start only databases
```

### Docker Compose Commands (if Make is not available)

```bash
# Main commands
docker compose up -d                    # Start all services
docker compose up --build -d           # Build and start
docker compose down                     # Stop all services
docker compose restart                 # Restart all services

# Logs
docker compose logs -f                 # Show logs for all services
docker compose logs -f backend         # Show backend logs
docker compose logs -f frontend        # Show frontend logs

# Status
docker compose ps                      # Show service status

# Cleanup
docker compose down -v --remove-orphans  # Stop and remove volumes
docker system prune -f                 # Clean unused resources
```

## 🗄️ Database

### PostgreSQL Connection

```bash
# Via Docker
make db-shell
# or
docker compose exec postgres psql -U postgres -d train_schedule

# Locally (if PostgreSQL is installed)
psql -h localhost -p 5432 -U postgres -d train_schedule
```

### Database Reset

```bash
make db-reset
# or
docker compose down -v
docker compose up -d postgres redis
```

## 🔧 Configuration

### Environment Variables

Main variables are configured in `docker-compose.yml`:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - secret key for JWT tokens
- `REDIS_HOST` - Redis server host
- `NODE_ENV` - environment (production/development)

### Ports

- **3000** - Backend API
- **3001** - Frontend
- **5432** - PostgreSQL
- **6379** - Redis
- **8080** - PgAdmin

## 📁 Project Structure

```
train_schedule_app/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── entities/       # Database entities
│   │   ├── train_routes/   # Train routes
│   │   └── users/          # Users
│   └── Dockerfile
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Pages
│   │   └── services/       # API services
│   └── Dockerfile
├── init-db/                # SQL initialization scripts
├── docker-compose.yml      # Docker configuration
├── Makefile               # Management commands
└── README.md
```

## 👨‍💻 Author

nf

## 🐛 Report an Issue

If you found a bug, create an [issue](https://github.com/nfdevua/train_schedule_app/issues) in the repository.
