FROM eclipse-temurin:17

CMD ["./gradlew", "clean", "build"]
VOLUME /tmp

ARG JAR_FILE=build/libs/*.jar

# Set environment variables
ENV SPRING_DATASOURCE_URL=jdbc:mysql://noname.cjyiguc8mbcp.ap-northeast-2.rds.amazonaws.com:3306/noname
ENV SPRING_DATASOURCE_USERNAME=admin
ENV SPRING_DATASOURCE_PASSWORD=noname19!(

COPY ${JAR_FILE} app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app.jar"]