# Karting Final

This project contains a Spring Boot backend and a React frontend. The previous
Docker based deployment files were removed so that the application can be run
locally without containers.

## Running the backend

1. Install **Java 17** and **Maven**.
2. Create a local MySQL database called `kartingrm` and make sure it is
   accessible at `localhost:3306` with user `kartuser` and password `kartpass`.
   You can change these values in
   `kartingrm/src/main/resources/application.properties`.
3. From the `kartingrm` directory run:

   ```bash
   mvn spring-boot:run
   ```

The API will be available on [http://localhost:8080](http://localhost:8080).

## Running the frontend

1. Install **Node.js 20**.
2. Inside `kartingrm-frontend` run:

   ```bash
   npm install
   npm run dev
   ```

The site will be served on [http://localhost:5173](http://localhost:5173) and it
will proxy API requests to `http://localhost:8080`.
