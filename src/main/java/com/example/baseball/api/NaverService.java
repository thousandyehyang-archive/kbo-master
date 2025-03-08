package com.example.baseball.api;

import io.github.cdimascio.dotenv.Dotenv;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

public class NaverService {
    private final String newsApiUrl;
    private final String clientId;
    private final String clientSecret;
    private final Dotenv dotenv;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String defaultImageUrl = "https://via.placeholder.com/300x200?text=No+Image";

    public NaverService() {
        dotenv = Dotenv.load();
        newsApiUrl = dotenv.get("NAVER_API_URL");
        clientId = dotenv.get("NAVER_CLIENT_ID");
        clientSecret = dotenv.get("NAVER_CLIENT_SECRET");
        System.out.println("Loaded NAVER_API_URL: " + newsApiUrl);
        System.out.println("Loaded NAVER_CLIENT_ID: " + clientId);
    }

    public String getNews(String query) throws IOException {
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
        String url = newsApiUrl + "?query=" + encodedQuery;
        System.out.println("Calling Naver News API at URL: " + url);
        HttpGet request = new HttpGet(url);
        request.addHeader("X-Naver-Client-Id", clientId);
        request.addHeader("X-Naver-Client-Secret", clientSecret);

        try (CloseableHttpClient httpClient = HttpClients.createDefault();
             CloseableHttpResponse response = httpClient.execute(request)) {
            String responseBody = EntityUtils.toString(response.getEntity());
            System.out.println("Naver News API response: " + responseBody);
            // Parse JSON and add image URL to each news item
            Map<String, Object> resultMap = objectMapper.readValue(responseBody, Map.class);
            List<Map<String, Object>> items = (List<Map<String, Object>>) resultMap.get("items");
            if (items != null) {
                for (Map<String, Object> item : items) {
                    String originallink = (String) item.get("originallink");
                    String imageUrl = extractImage(originallink);
                    item.put("image", imageUrl);
                }
            }
            // Convert back to JSON string with added image fields
            return objectMapper.writeValueAsString(resultMap);
        }
    }

    private String extractImage(String articleUrl) {
        try {
            // Jsoup를 사용하여 HTML 페이지 가져오기 (타임아웃 5000ms)
            Document doc = Jsoup.connect(articleUrl).timeout(5000).get();
            // meta 태그 중 og:image 추출
            Elements metaOgImage = doc.select("meta[property=og:image]");
            if (!metaOgImage.isEmpty()) {
                String content = metaOgImage.attr("content");
                if (content != null && !content.isEmpty()) {
                    return content;
                }
            }
            // 없으면 첫 번째 img 태그의 src 추출
            Elements imgTags = doc.select("img");
            if (!imgTags.isEmpty()) {
                String src = imgTags.first().attr("src");
                if (src != null && !src.isEmpty()) {
                    return src;
                }
            }
        } catch (Exception e) {
            System.out.println("이미지 추출 실패: " + e.getMessage());
        }
        return defaultImageUrl;
    }
}