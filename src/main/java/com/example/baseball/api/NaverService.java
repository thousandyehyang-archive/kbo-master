package com.example.baseball.api;

import io.github.cdimascio.dotenv.Dotenv;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

public class NaverService {
    private final String naverApiUrl;
    private final String clientId;
    private final String clientSecret;
    private final Dotenv dotenv;

    public NaverService() {
        dotenv = Dotenv.load();
        naverApiUrl = dotenv.get("NAVER_API_URL");
        clientId = dotenv.get("NAVER_CLIENT_ID");
        clientSecret = dotenv.get("NAVER_CLIENT_SECRET");
    }

    public String getNews(String query) throws IOException {
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
        String url = naverApiUrl + "?query=" + encodedQuery;

        HttpGet request = new HttpGet(url);
        // 네이버 API 요청 헤더 추가
        request.addHeader("X-Naver-Client-Id", clientId);
        request.addHeader("X-Naver-Client-Secret", clientSecret);

        try (CloseableHttpClient httpClient = HttpClients.createDefault();
             CloseableHttpResponse response = httpClient.execute(request)) {
            String responseBody = EntityUtils.toString(response.getEntity());
            return responseBody;
        }
    }
}