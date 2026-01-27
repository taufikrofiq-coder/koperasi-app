FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY target/*.jar app.jar

RUN mkdir -p uploads data/files logs

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx256m", "-Xss512k", "-jar", "app.jar", "--spring.profiles.active=render"]
