# Canvion Cycling - Training Tracker

Web application for cycling training tracking with Strava integration.

## Features

- 🚴 Track cycling activities (manual or Strava sync)
- 📊 Detailed statistics (distance, speed, heart rate, cadence, temperature)
- 🗺️ GPS route visualization
- 📈 Training analytics
- 🔐 Secure OAuth2 Strava integration

## Tech Stack

### Backend
- Java 21
- Spring Boot 3.2.2
- PostgreSQL 15
- JWT Authentication
- OAuth2 (Strava)

### Frontend
- Angular 17+
- Material Design
- Leaflet (maps)
- Chart.js (graphs)

## Setup

### Prerequisites
- Java 21+
- Node.js 18+
- Docker & Docker Compose
- Strava API credentials

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/canvion/canvion-cycling.git
cd canvion-cycling
```

2. Copy configuration template
```bash
cd backend/src/main/resources
cp application.properties.example application.properties
```

3. Configure your secrets in `application.properties`:
- Database credentials
- JWT secret (generate with `openssl rand -base64 64`)
- Encryption key (32 characters)
- Strava API credentials

4. Start PostgreSQL
```bash
docker-compose up -d postgres
```

5. Run backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
ng serve
```

Navigate to `http://localhost:4200`

## Strava API Setup

1. Create app at https://www.strava.com/settings/api
2. Set authorization callback: `http://localhost:8080/api/strava/callback`
3. Copy Client ID and Client Secret to `application.properties`

## Production Deployment

Use environment variables for all secrets:
- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REDIRECT_URI`
- `FRONTEND_URL`

Run with production profile:
```bash
java -jar -Dspring.profiles.active=prod cycling-backend.jar
```

## Author

Adrian Cervera - DAW Student

## License

This project is for educational purposes (DAW final project).
