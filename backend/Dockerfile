# syntax=docker/dockerfile:1

# --- Etape 1 : compilation ---------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Les dependances sont resolues avant de copier les sources : tant que le pom
# ne change pas, cette couche est reutilisee et le build est bien plus rapide.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Etape 2 : execution -----------------------------------------------------
# Image JRE seule : ni Maven ni JDK ne partent en production.
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Utilisateur non privilegie : un conteneur applicatif n'a aucune raison
# de tourner en root.
RUN addgroup -S app && adduser -S app -G app

COPY --from=build /build/target/*.jar app.jar
RUN chown app:app app.jar
USER app

# Cloud Run impose le port via la variable PORT ; 8080 sert de repli local.
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java -XX:MaxRAMPercentage=75 -jar app.jar"]
