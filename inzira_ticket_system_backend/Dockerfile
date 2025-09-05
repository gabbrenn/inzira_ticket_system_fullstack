## Multi-stage Dockerfile for Spring Boot backend (Render friendly)

# ------------------------ BUILD STAGE ------------------------
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /workspace

# Leverage layer caching for dependencies
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Copy source code
COPY src ./src

# Build application (skip tests)
RUN mvn -q -DskipTests package

# Extract layers (Spring Boot layertools) for efficient runtime image caching
RUN mkdir extracted && cd extracted && \
    java -Djarmode=layertools -jar ../target/*.jar extract

# ------------------------ RUNTIME STAGE ----------------------
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

# Optional: install curl for healthcheck
RUN apk add --no-cache curl

# Create runtime user
RUN addgroup -S spring && adduser -S spring -G spring

# Copy layered contents
COPY --from=build /workspace/extracted/dependencies/ ./
COPY --from=build /workspace/extracted/spring-boot-loader/ ./
COPY --from=build /workspace/extracted/snapshot-dependencies/ ./
COPY --from=build /workspace/extracted/application/ ./

# Expose application port
EXPOSE 8080

# Default JVM / Spring env (overridable)
ENV JAVA_OPTS="-Xms256m -Xmx512m" \
    TZ=UTC \
    SPRING_PROFILES_ACTIVE=default

# Persistent uploads (mount volume in Render)
RUN mkdir -p /app/uploads && chown -R spring:spring /app/uploads
VOLUME ["/app/uploads"]

USER spring

# Healthcheck (enable only if actuator dependency & endpoint exposed)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD curl -fsS http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh","-c","java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
