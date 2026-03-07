# Canvion Cycling - Training Tracker

Web application for cycling training tracking with Strava integration.

🌐 **Live demo:** [http://161.35.209.217/login](http://161.35.209.217/login)

---

## Features

- 🚴 Track cycling activities (manual or Strava sync)
- 📊 Detailed statistics (distance, time, elevation, heart rate, cadence)
- 🗺️ GPS route visualization with Leaflet
- 📈 Weekly, monthly and yearly analytics
- 🔥 Training streaks and weekly goal tracking
- 🔐 Secure JWT authentication + OAuth2 Strava integration
- 📱 Responsive design (mobile & desktop)
- 🔄 Automatic activity sync via Strava webhooks

## Tech Stack

### Backend
- Java 21
- Spring Boot 3.2.2
- PostgreSQL 15
- JWT Authentication
- OAuth2 (Strava)
- Spring Boot Actuator

### Frontend
- Angular 17+
- Material Design
- Leaflet (maps)
- Chart.js (graphs)

### Infrastructure
- DigitalOcean (Ubuntu 24)
- Nginx + Certbot
- systemd service

---

## Local Setup

### Prerequisites
- Java 21+
- Node.js 18+
- Docker & Docker Compose
- Strava API credentials

### Backend

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
   - JWT secret (`openssl rand -base64 64`)
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

### Frontend

```bash
cd cycling-frontend
npm install
ng serve
```

Navigate to `http://localhost:4200`

---

## Strava API Setup

1. Create app at [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Set authorization callback: `http://localhost:8080/api/strava/callback`
3. Copy Client ID and Client Secret to `application.properties`

---

## Production Deployment

### Environment variables required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URL |
| `DATABASE_USERNAME` | Database user |
| `DATABASE_PASSWORD` | Database password |
| `JWT_SECRET` | JWT signing secret |
| `ENCRYPTION_KEY` | 32-character encryption key |
| `STRAVA_CLIENT_ID` | Strava app client ID |
| `STRAVA_CLIENT_SECRET` | Strava app client secret |
| `STRAVA_REDIRECT_URI` | OAuth callback URL |
| `FRONTEND_URL` | Frontend base URL |

### Build and deploy

```bash
# Backend
cd backend
mvn clean package -DskipTests
systemctl restart canvion-cycling

# Frontend
cd cycling-frontend
ng build --configuration production
scp -r dist/cycling-frontend/browser/* user@server:/var/www/canvion-cycling/
```

### Health check

```bash
curl http://localhost:8080/actuator/health
```

---

## Author

Adrian Cervera — DAW Student

## License

This project is for educational purposes (DAW final project).
