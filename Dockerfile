# Tomcat 10 이미지를 사용 (Tomcat 10은 Jakarta EE 기반)
FROM tomcat:10.1.36

# WAR 파일을 Tomcat의 webapps 디렉토리로 복사
COPY target/kbo-master.war /usr/local/tomcat/webapps/

# Tomcat 기본 포트 8080 노출
EXPOSE 8080