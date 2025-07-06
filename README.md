# Karting Final

*Para la versión en español consulta [README.es.md](README.es.md).* 

Karting Final is a reservation management system for a go-kart track. The repository is split in two main modules:

- **kartingrm** – Spring Boot REST API written in Java.
- **kartingrm-frontend** – React SPA powered by Vite.

The backend exposes endpoints for managing clients, karts, sessions, reservations and payments. It also generates PDF receipts and several income reports. The frontend consumes these APIs to provide an administration interface.

---

## Repository layout

```
./
├── kartingrm             # Spring Boot backend
├── kartingrm-frontend    # React frontend
└── secrets               # local files such as mail credentials
```

Each module can be worked on independently as described below.

---

## Backend (kartingrm)

1. **Prerequisites**
   - Java 17
   - Maven
   - MySQL available locally
2. **Configuration**
   - Create a database named `kartingrm` accessible at `localhost:3306`.
   - Default credentials are `root/password` but can be overridden using the environment variables `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` or by editing `src/main/resources/application.properties`.
3. **Running in development**
   ```bash
   cd kartingrm
   mvn spring-boot:run
   ```
   The API will be available on [http://localhost:8080](http://localhost:8080).
4. **Building a jar**
   ```bash
   mvn package
   java -jar target/kartingrm-0.0.1-SNAPSHOT.jar
   ```

---

## Frontend (kartingrm-frontend)

1. **Prerequisites** – Node.js 20
2. **Running in development**
   ```bash
   cd kartingrm-frontend
   npm install
   npm run dev
   ```
   The development server runs on [http://localhost:5173](http://localhost:5173) and proxies API requests to `http://localhost:8080`. Set the variable `VITE_BACKEND_API_URL` if your backend runs elsewhere.
3. **Building for production**
   ```bash
   npm run build
   ```
   The static site is generated in `kartingrm-frontend/dist/` and can be served with any web server.

---

## Additional notes

- Some features send email notifications. Credentials for the SMTP account are read from `src/main/resources/application.properties`. The `secrets` directory can be used to store sensitive values locally.
- Metrics are exposed through the Spring Boot actuator and Prometheus registry.

With both services running you can manage reservations, monitor session availability and issue payments directly from the web UI.
