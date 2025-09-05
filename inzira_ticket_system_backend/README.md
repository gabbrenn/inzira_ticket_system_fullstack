# Inzira Ticket System – Backend

Spring Boot backend for the Inzira multi‑role bus ticketing platform. Provides authentication, booking, schedules, agency management, payments, analytics, file uploads (logos, tickets), and admin reporting. Supports PostgreSQL, MySQL, or local H2 (default) with zero code changes.

## Contents
1. Features
2. Tech Stack
3. Architecture & Modules
4. Quick Start (H2)
5. Database (Postgres / MySQL)
6. Environment Variables (.env)
7. Scheduled Jobs
8. Analytics & Listings
9. File Uploads
10. Docker & Docker Compose
11. Distroless / Layered Images
12. Health & Actuator
13. Deployment (Render example)
14. Common Tasks
15. Contributing
16. License

---
## 1. Features
Core:
- JWT Authentication & Role-based Authorization
- Multi-role domain: Admin, Agency, Branch Manager, Agent, Customer
- Booking with seat allocation & PDF ticket + QR code
- Payments (card / cash abstraction; Stripe hooks placeholders)
- Route, District, Schedule, Agency management
- File uploads (logos, ticket PDFs) under `uploads/`
- Unpaid booking auto-clean (5 min timeout)
- CORS configurable via env / property

Admin & Analytics:
- Metrics summary (bookings, payments, schedule stats)
- Time-series trends (daily / weekly) DB-agnostic
- Top agencies by bookings & revenue
- Bookings & Payments listings with filters & CSV export
- Grouped agency summaries

DevOps:
- Multi-DB support (hibernate infers driver)
- H2 fallback for local dev (no env required)
- Docker multi-stage build + distroless option
- Layered JAR for faster container rebuilds
- Actuator health endpoints (liveness/readiness)

## 2. Tech Stack
- Spring Boot 3.4.x (Web, Security, Data JPA, Validation, Scheduling, Actuator)
- Java 17 (Temurin)
- PostgreSQL / MySQL / H2
- JWT (jjwt)
- MapStruct, Lombok
- ZXing (QR), iText (PDF)
- Stripe SDK
- Maven

## 3. Architecture & Modules
Package overview (simplified):
```
com.inzira
  ├─ admin       (admin controllers: metrics, analytics, listings)
  ├─ agency      (agency operations)
  ├─ customer    (customer booking endpoints)
  ├─ shared      (entities, repositories, security, utils, scheduling)
  └─ InziraTicketSystemApplication
```

Scheduling: cleanup tasks run via `@EnableScheduling` for unpaid bookings.

## 4. Quick Start (H2 – No External DB)
```bash
mvn spring-boot:run
# App on http://localhost:8080
```
Defaults (from `application.properties`): H2 file DB `jdbc:h2:file:./data/inzira`.

## 5. Database Configuration
Set these environment variables (or `.env`) to switch DB:
PostgreSQL:
```
DB_URL=jdbc:postgresql://host:5432/dbname
DB_USERNAME=postgres
DB_PASSWORD=secret
```
MySQL:
```
DB_URL=jdbc:mysql://host:3306/dbname
DB_USERNAME=dbuser
DB_PASSWORD=secret
```
H2 (explicit):
```
DB_URL=jdbc:h2:file:./data/inzira;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
DB_USERNAME=sa
DB_PASSWORD=
```
Hibernate dialect is auto-detected; no need to set manually.

## 6. Environment Variables (.env)
Sample provided in `.env.example`:
```
JWT_SECRET=change-me
app.cors.allowed-origins=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
The `spring-dotenv` library loads `.env` automatically (dotenv.enabled=true).

## 7. Scheduled Jobs
- Unpaid Booking Cleanup: runs every minute; removes bookings older than 5 minutes with unpaid status and restores seats.

## 8. Analytics & Listings
Endpoints (prefix `/api/admin`):
- `/metrics/summary`
- `/analytics/bookings/trend/day|week`
- `/analytics/payments/trend/day|week`
- `/analytics/top/agencies/bookings|revenue`
- `/bookings` & `/payments` (filters: status, agencyId, start, end)
- `/bookings/export` & `/payments/export` (CSV)
- `/groups/agencies/summary`

All trend computations are DB-agnostic (Java time bucket iteration).

## 9. File Uploads
Stored under `uploads/` (logos, ticket PDFs). Mount as persistent volume in production. Response URLs typically served via static mapping (ensure resource handler or direct mapping in config).

## 10. Docker & Docker Compose
Build standard image:
```bash
docker build -t inzira-backend ./inzira_ticket_system_backend
docker run --rm -p 8080:8080 inzira-backend
```

Compose (Postgres profile):
```bash
docker compose --profile postgres up --build
```
Compose (MySQL profile):
```bash
docker compose --profile mysql up --build
```
Services:
- `backend` (Postgres) / `backend-mysql` (MySQL)
- `postgres`, `mysql`
Volumes: `pgdata`, `mysqldata`, `backend_uploads`

## 11. Distroless / Layered Images
- Default `Dockerfile` uses multi-stage + Spring Boot layertools.
- `Dockerfile.distroless` produces a smaller, minimal runtime (no shell, use for production). Example:
```bash
docker build -f inzira_ticket_system_backend/Dockerfile.distroless -t inzira-backend-distroless ./inzira_ticket_system_backend
```

## 12. Health & Actuator
Enabled endpoints:
```
/actuator/health
/actuator/info
```
You can uncomment HEALTHCHECK in `Dockerfile` once Actuator is verified. Add more exposure via:
```
management.endpoints.web.exposure.include=health,info,metrics
```

## 13. Deployment (Render Example)
1. Create new Web Service -> Select backend directory.
2. If using Docker: Render detects `Dockerfile`.
3. Set environment variables (DB_*, JWT_SECRET, Stripe keys, app.cors.allowed-origins).
4. Add Persistent Disk mounted at `/app/uploads`.
5. (Optional) Switch to distroless: rename or specify alt Dockerfile.
6. For health monitoring: enable healthcheck hitting `/actuator/health`.

## 14. Common Tasks
Create Admin (if no UI flow): implement or expose initial bootstrap endpoint (not included by default) or manually insert row.
Clear Local H2: delete `./data/inzira*` files.
CSV Exports: admin endpoints return `text/csv` with `Content-Disposition` header.
Switch DB quickly:
```bash
export DB_URL=jdbc:postgresql://localhost:5432/inzira
export DB_USERNAME=inzira
export DB_PASSWORD=secret
mvn spring-boot:run
```

## 15. Contributing
1. Fork & branch: `git checkout -b feature/xyz`
2. Write tests / keep layers small.
3. Run build: `mvn -DskipTests package` (or with tests).
4. Open PR with clear description.

Coding Guidelines:
- Prefer constructor injection
- Keep controllers thin; use services (where applicable)
- Avoid DB-specific SQL in repositories for portability
- Null-safe BigDecimal math for payment sums

## 16. License
Apache 2.0 (see root `LICENSE`).

---
Built for scalable multi-agency ticketing.📍
