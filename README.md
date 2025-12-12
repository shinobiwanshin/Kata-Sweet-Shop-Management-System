# Sweet Shop Management System

A full-stack application for managing a sweet shop, built with Java Spring Boot and React.

## Features

- **Authentication**: User registration and login with JWT. Role-based access control (USER, ADMIN).
- **Sweets Management**: View available sweets. Admins can add new sweets.
- **Inventory**: Purchase sweets (decreases stock). Admins can restock sweets.
- **Dashboard**: Interactive UI for browsing and managing sweets.

## Tech Stack

- **Backend**: Java 21, Spring Boot 3.3.0, Spring Security, Spring Data JPA, H2/PostgreSQL (configured for Postgres).
- **Frontend**: React, Tailwind CSS, Axios, React Router.
- **Database**: PostgreSQL.
- **Containerization**: Docker, Docker Compose.

## Prerequisites

- Docker & Docker Compose
- Java 21 (for local backend dev)
- Node.js (for local frontend dev)

## Setup & Running

### Using Docker (Recommended)

1.  Clone the repository.
2.  Run `docker-compose up --build`.
3.  Access the application at `http://localhost:80`.

### Local Development

**Backend:**

1.  Navigate to `backend`.
2.  Run `./mvnw spring-boot:run`.

**Frontend:**

1.  Navigate to `frontend`.
2.  Run `npm install`.
3.  Run `npm start`.

## API Endpoints

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Login and get JWT.
- `GET /api/sweets`: List all sweets.
- `POST /api/sweets`: Add a sweet (Admin only).
- `POST /api/sweets/{id}/purchase`: Buy a sweet.
- `POST /api/sweets/{id}/restock`: Restock a sweet (Admin only).

## Testing

**Backend:**
Run `./mvnw test` in the `backend` directory.
