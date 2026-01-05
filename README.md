# Smart Exchange

A full-stack web application built with NestJS and React for real-time chat and language exchange.

## 🚀 Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT, Passport
- **Real-time**: Socket.io
- **AI Integration**: Google GenAI
- **Language**: TypeScript

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Internationalization**: i18next
- **OAuth**: Google OAuth
- **Language**: TypeScript

## 📋 Prerequisites

### Option 1: Docker (Recommended)
- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)

### Option 2: Local Development
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher)

## 🛠️ Installation (Local Development)

> **Note:** For the easiest setup, see the [Docker Setup](#-docker-setup-recommended) section below.

### 1. Clone the repository
```bash
git clone <repository-url>
cd smart-exchange
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the backend directory with the following:
# DATABASE_URL="mysql://root:your_password@localhost:3306/smart_exchange"
# JWT_SECRET="your-jwt-secret"
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
# If you have a seed script
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file in the frontend directory with:
# VITE_API_URL=http://localhost:3000
# VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Database Setup

Create the MySQL database:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE smart_exchange;"

# Or login to MySQL and create manually
mysql -u root -p
mysql> CREATE DATABASE smart_exchange;
mysql> exit;
```

## 🐳 Docker Setup (Recommended)

The easiest way to run the entire application stack is using Docker Compose.

### Prerequisites
- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-exchange
   ```

2. **Configure environment variables**
   ```bash
   # Copy the Docker environment template
   cp .env.docker .env
   
   # Edit .env and update the following:
   # - GOOGLE_CLIENT_ID
   # - GOOGLE_CLIENT_SECRET
   # - GEMINI_API_KEY
   # - JWT_SECRET (change to a secure random string)
   # - MYSQL_ROOT_PASSWORD (change to a secure password)
   # - MYSQL_PASSWORD (change to a secure password)
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Check if services are running**
   ```bash
   docker-compose ps
   ```

5. **View logs**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f mysql
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - MySQL: localhost:3306

7. **Stop all services**
   ```bash
   docker-compose down
   ```

8. **Stop and remove all data (including database)**
   ```bash
   docker-compose down -v
   ```

### Docker Commands Reference

```bash
# Rebuild containers after code changes
docker-compose up -d --build

# Restart a specific service
docker-compose restart backend

# Execute commands in a running container
docker-compose exec backend npx prisma db push
docker-compose exec backend npm run test

# View container resource usage
docker stats

# Remove stopped containers and unused images
docker system prune
```

### Troubleshooting Docker Setup

**Database connection errors:**
```bash
# Check if MySQL is healthy
docker-compose ps mysql

# View MySQL logs
docker-compose logs mysql

# Manually run Prisma migration
docker-compose exec backend npx prisma db push
```

**Port conflicts:**
If ports 3000, 5173, or 3306 are already in use, update the `.env` file:
```env
BACKEND_PORT=8080
FRONTEND_PORT=8080
MYSQL_PORT=3307
```

**Hot reload not working:**
Make sure volume mounts are properly configured in `docker-compose.yml`



## 🚀 Running the Application

### Development Mode

You need to run both backend and frontend servers simultaneously.

#### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```
The backend server will start on `http://localhost:3000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
The frontend application will start on `http://localhost:5173` (default Vite port)

### Production Mode

#### Build Backend
```bash
cd backend
npm run build
npm run start:prod
```

#### Build Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
smart-exchange/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── chat/           # Chat module
│   │   ├── user/           # User module
│   │   └── main.ts         # Application entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   └── .env               # Environment variables (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── main.tsx        # Application entry point
│   ├── package.json
│   └── .env.local         # Environment variables (gitignored)
├── sql/
│   └── smart_exchange.sql  # Database schema
└── README.md
```

## 🔑 Features

- **User Authentication**: JWT-based authentication with Google OAuth support
- **Real-time Chat**: Socket.io powered instant messaging
- **Language Exchange**: Support for multiple languages with i18next
- **AI Analysis**: Google GenAI integration for message analysis
- **Theme Support**: Light/Dark mode
- **Responsive Design**: Mobile-friendly interface

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🔧 Available Scripts

### Backend
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot-reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://root:your_password@localhost:3306/smart_exchange"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
GEMINI_API_KEY="your-gemini-api-key"
PORT="8080"
NODE_ENV="development"
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MySQL is running: `sudo systemctl status mysql` (Linux) or `brew services list` (macOS)
- Verify DATABASE_URL in backend/.env is correct
- Check firewall settings for MySQL port (default: 3306)
- Test MySQL connection: `mysql -u root -p`

### Port Conflicts
- Backend default port: 3000
- Frontend default port: 5173
- Change ports in respective configuration files if needed

### Prisma Issues
```bash
# Reset Prisma client
cd backend
npx prisma generate

# Reset database (WARNING: This will delete all data)
npx prisma db push --force-reset
```

## 📄 License

This project is licensed under UNLICENSED - see the package.json for details.

## 👥 Authors

- Your Name

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Coding! 🎉**
