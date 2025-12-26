# Sweetify - Sweet Shop Management System 🍬

A modern, full-stack e-commerce application for managing a sweet shop. Built with Spring Boot (Backend) and React (Frontend), featuring a premium UI, secure authentication, and robust inventory management.

![Sweetify Dashboard](https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=2070&auto=format&fit=crop)

## 🚀 Features

### Customer Features

- **Browse Sweets**: Filter by category, price, and search by name.
- **Rich UI**: Beautiful, responsive design with animations and glassmorphism effects.
- **User Accounts**: Secure signup and login with JWT authentication.
- **Shopping**: Purchase sweets (simulated) with stock validation.
- **Order History**: View past purchases (Profile section).

### Admin Features

- **Dashboard**: Overview of inventory and stock levels.
- **Inventory Management**: Add, edit, and delete sweets.
- **Stock Control**: Restock items and track low stock alerts.
- **Image Management**: Upload product images.

## 🛠️ Tech Stack

### Backend

- **Java 21**
- **Spring Boot 3.3.0**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA** (PostgreSQL)
- **PostgreSQL** (Database)
- **Docker** (Containerization)

### Frontend

- **React 18**
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **Axios** (API Client)

## 🏗️ Architecture

The application follows a standard client-server architecture:

- **Frontend**: React SPA deployed on Vercel.
- **Backend**: Spring Boot REST API deployed on Render (Dockerized).
- **Database**: PostgreSQL hosted on Render.

## 🚦 Getting Started

### Prerequisites

- Java 21+
- Node.js 18+
- PostgreSQL
- Maven

### Local Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/shinobiwanshin/Sweetify.git
cd Sweetify
```

#### 2. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Configure database in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/sweetshop
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   Backend will start at `http://localhost:8080`.

#### 3. Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   ```
4. Start the development server:
   ```bash
   npm start
   ```
   Frontend will start at `http://localhost:3000`.

## 📦 Deployment

### Backend (Render)

1. Create a **Web Service** on Render connected to your repo.
2. **Runtime**: Docker
3. **Environment Variables** (Required):
   - `SPRING_DATASOURCE_URL`: `postgres://...` (Internal DB URL)
   - `SPRING_DATASOURCE_USERNAME`: `...`
   - `SPRING_DATASOURCE_PASSWORD`: `...`
   - `JWT_SECRET`: (Generate a secure 256-bit key)
   - `CLERK_SECRET_KEY`: (Required - Clerk Secret Key from Clerk Dashboard)
   - `CLERK_JWKS_URI`: (Required - Clerk JWKS URI from Clerk Dashboard)
   - `CLERK_WEBHOOK_SECRET`: (Required - Clerk Webhook Secret from Clerk Dashboard)
4. **Note**: The project includes an `entrypoint.sh` script to automatically handle Render's database URL format.

### Frontend (Vercel)

1. Import project to Vercel.
2. **Root Directory**: `frontend`
3. **Environment Variables**:
   - `REACT_APP_API_URL`: `https://your-backend-service.onrender.com/api` (Must include `/api` suffix)

### 🔐 Security Notes

**⚠️ NEVER commit secrets to version control!**

- All sensitive configuration (API keys, secrets, database credentials) must be set via environment variables
- Use a secret manager (like Render's environment variables, AWS Secrets Manager, or similar) for production deployments
- The `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` are particularly sensitive and should be rotated regularly
- If you suspect any secret has been exposed, revoke it immediately in the Clerk Dashboard and generate new ones

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT

### Sweets (Public)

- `GET /api/sweets` - Get all sweets
- `GET /api/sweets/{id}` - Get sweet by ID

### Sweets (Admin)

- `POST /api/sweets` - Add new sweet
- `PUT /api/sweets/{id}` - Update sweet
- `DELETE /api/sweets/{id}` - Delete sweet
- `POST /api/sweets/{id}/restock` - Restock sweet

### Purchases

- `POST /api/sweets/{id}/purchase` - Purchase a sweet

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
