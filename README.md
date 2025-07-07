# Karting Final

Karting Final es un sistema de gestion de reservas para una pista de karts. Este repositorio contiene dos modulos principales:

- **kartingrm** – API REST desarrollada con Spring Boot.
- **kartingrm-frontend** – Aplicacion SPA en React utilizando Vite.

El backend ofrece endpoints para gestionar clientes, karts, sesiones, reservas y pagos. Tambien genera recibos en PDF e informes de ingresos. El frontend consume dichas APIs para brindar una interfaz de administracion.

---

## Estructura del repositorio

```
./
├── kartingrm             # Backend Spring Boot
├── kartingrm-frontend    # Frontend React
└── secrets               # Archivos locales (ej. credenciales de correo)
```

Cada modulo puede trabajarse de forma independiente como se describe a continuacion.

---

## Backend (kartingrm)

1. **Requisitos previos**
   - Java 17
   - Maven
   - MySQL disponible localmente
2. **Configuracion**
   - Crear una base de datos llamada `kartingrm` accesible en `localhost:3306`.
   - Las credenciales por defecto son `root/password`, pero pueden modificarse mediante las variables de entorno `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD` o editando `src/main/resources/application.properties`.
3. **Ejecucion en desarrollo**
   ```bash
   cd kartingrm
   mvn spring-boot:run
   ```
   La API estara disponible en [http://localhost:8080](http://localhost:8080).
4. **Generar un jar**
   ```bash
   mvn package
   java -jar target/kartingrm-0.0.1-SNAPSHOT.jar
   ```
5. **Pruebas**
   ```bash
   mvn test
   ```
   Se incluyen pruebas unitarias para los servicios principales.

---

## Frontend (kartingrm-frontend)

1. **Requisitos previos** – Node.js 20
2. **Ejecucion en desarrollo**
   ```bash
   cd kartingrm-frontend
   npm install
   npm run dev
   ```
   El servidor de desarrollo se ejecuta en [http://localhost:5173](http://localhost:5173) y redirige las peticiones a la API en `http://localhost:8080`. Puedes establecer `VITE_BACKEND_API_URL` si el backend se ejecuta en otra direccion.
3. **Compilacion para produccion**
   ```bash
   npm run build
   ```
   Los archivos estaticos se generan en `kartingrm-frontend/dist/` y pueden servirse con cualquier servidor web.
4. **Revision de estilo**
   ```bash
   npm run lint
   ```

---

## Notas adicionales

- Algunas funcionalidades envian notificaciones por correo electronico. Las credenciales SMTP se leen de `src/main/resources/application.properties`; puedes utilizar la carpeta `secrets` para almacenarlas localmente.
- El sistema expone metricas mediante el actuator de Spring Boot y Prometheus.
- Con ambos servicios en funcionamiento podras gestionar las reservas, monitorizar la disponibilidad de las sesiones y registrar pagos desde la interfaz web.

