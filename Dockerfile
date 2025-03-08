# Build stage: Maven 빌드
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
# pom.xml과 소스 코드를 복사합니다.
COPY pom.xml .
COPY src ./src
# Maven으로 프로젝트 빌드 (WAR 파일 생성)
RUN mvn clean package

# Run stage: Tomcat 10 기반 이미지 사용 (Jakarta EE)
FROM tomcat:10.1.36-jdk17-temurin
# 빌드 스테이지에서 생성한 WAR 파일을 Tomcat의 ROOT.war로 복사
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war
# Tomcat 기본 포트 8080 노출
EXPOSE 8080
CMD ["catalina.sh", "run"]