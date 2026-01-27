# =====================
# 1️⃣ BUILD STAGE
# =====================
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests


# =====================
# 2️⃣ RUN STAGE
# =====================
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

RUN mkdir -p uploads data/files logs

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx256m", "-Xss512k", "-jar", "app.jar", "--spring.profiles.active=render"]
