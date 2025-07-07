# Karting Final

Karting Final es un sistema de gestión de reservas para una pista de karts. El repositorio se divide en dos módulos principales:

- **kartingrm** – API REST de Spring Boot escrita en Java.
- **kartingrm-frontend** – SPA en React usando Vite.

El backend expone endpoints para gestionar clientes, karts, sesiones, reservas y pagos. También genera recibos PDF y varios informes de ingresos. El frontend consume estas APIs para ofrecer una interfaz de administración.

## Características principales

- Operaciones CRUD para karts, clientes y sesiones
- Gestión de reservas con control de capacidad
- Procesamiento de pagos y generación de recibos PDF
- Informes de ingresos y métricas para Prometheus
- Notificaciones por correo en las confirmaciones de reserva

---

## Estructura del repositorio

```
./
├── kartingrm             # backend Spring Boot
├── kartingrm-frontend    # frontend React
└── secrets               # archivos locales como credenciales de correo
```

Cada módulo puede trabajarse de forma independiente como se explica a continuación.

---

## Backend (kartingrm)

1. **Requisitos previos**
   - Java 17
   - Maven
   - MySQL disponible localmente
2. **Configuración**
   - Crear una base de datos llamada `kartingrm` accesible en `localhost:3306`.
   - Las credenciales por defecto son `root/password`, pero se pueden modificar mediante las variables de entorno `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD` o editando `src/main/resources/application.properties`.
3. **Ejecución en desarrollo**
   ```bash
   cd kartingrm
   mvn spring-boot:run
   ```
   La API estará disponible en [http://localhost:8080](http://localhost:8080).
4. **Generar un jar**
   ```bash
   mvn package
   java -jar target/kartingrm-0.0.1-SNAPSHOT.jar
   ```
5. **Ejecutar pruebas**
   ```bash
   mvn test
   ```
   Las pruebas unitarias cubren la capa de servicios.

---

## Frontend (kartingrm-frontend)

1. **Requisitos previos** – Node.js 20
2. **Ejecución en desarrollo**
   ```bash
   cd kartingrm-frontend
   npm install
   npm run dev
   ```
   El servidor de desarrollo se ejecuta en [http://localhost:5173](http://localhost:5173) y redirige peticiones a la API en `http://localhost:8080`. Usa la variable `VITE_BACKEND_API_URL` si tu backend se ejecuta en otra dirección.
3. **Compilación para producción**
   ```bash
   npm run build
   ```
   El sitio estático se genera en `kartingrm-frontend/dist/` y puede servirse con cualquier servidor web.
   Define `VITE_BACKEND_API_URL` durante la compilación si el backend se aloja en otra dirección.

---

## Notas adicionales

- Algunas funcionalidades envían notificaciones por correo electrónico. Las credenciales para la cuenta SMTP se leen de `src/main/resources/application.properties`. El directorio `secrets` puede usarse para almacenar valores sensibles localmente.
- Las métricas se exponen mediante el actuador de Spring Boot y el registro de Prometheus.
- El puerto del servidor y la capacidad por sesión pueden cambiarse con las variables de entorno `SERVER_PORT` y `KARTINGRM_DEFAULT_SESSION_CAPACITY`.

Con ambos servicios en funcionamiento puedes gestionar reservas, monitorizar la disponibilidad de las sesiones y emitir pagos directamente desde la interfaz web.
