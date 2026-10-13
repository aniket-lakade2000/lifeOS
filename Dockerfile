# ---------- Stage 1: build the React app ----------
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
RUN npm install -g pnpm@9
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm run build

# ---------- Stage 2: build the Spring Boot jar (with the UI inside) ----------
FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /backend
COPY backend/mvnw backend/pom.xml ./
COPY backend/.mvn .mvn
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline
COPY backend/src src
COPY --from=frontend-build /frontend/dist src/main/resources/static
RUN ./mvnw -B package -DskipTests
RUN cp target/*.jar app.jar

# ---------- Stage 3: slim runtime image ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --no-create-home appuser
COPY --from=backend-build /backend/app.jar app.jar
USER appuser
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]