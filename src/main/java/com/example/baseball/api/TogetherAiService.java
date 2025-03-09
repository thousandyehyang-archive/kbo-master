package com.example.baseball.api;

import io.github.cdimascio.dotenv.Dotenv;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;

public class TogetherAiService {
    private final String endpoint;
    private final String apiKey;
//    private final Dotenv dotenv;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TogetherAiService() {
//        dotenv = Dotenv.load();
//        endpoint = dotenv.get("TOGETHER_AI_API_ENDPOINT");
//        apiKey = dotenv.get("TOGETHER_AI_API_KEY");
//        System.out.println("Loaded Together AI Endpoint: " + endpoint);
//        System.out.println("Loaded Together AI API Key: " + apiKey);
        endpoint = System.getenv("TOGETHER_AI_API_ENDPOINT");
        apiKey = System.getenv("TOGETHER_AI_API_KEY");
    }

    public String askQuestion(String query) throws IOException {
        System.out.println("Calling Together AI API for query: " + query);

        HttpPost request = new HttpPost(endpoint);
        // 인증 및 Content-Type 헤더 설정
        request.addHeader("Authorization", "Bearer " + apiKey);
        request.addHeader("Content-Type", "application/json");

        // 요청 페이로드 구성
        Map<String, Object> payload = new HashMap<>();
        // 모델 이름은 .env에서 관리 (없으면 기본값 togetherai-chat 사용)
        String model = System.getenv("TOGETHER_AI_MODEL");
        if (model == null || model.isEmpty()) {
            model = "togetherai-chat";
        }
        payload.put("model", model);

        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", System.getenv("TOGETHER_AI_PROMPT"));

        // 사용자 메시지 추가
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", query);

        // 시스템 메시지와 사용자 메시지를 모두 포함 (순서대로 전송)
        payload.put("messages", List.of(systemMsg, userMsg));

        payload.put("temperature", 0.6);
        payload.put("max_tokens", 300);

        String jsonPayload = objectMapper.writeValueAsString(payload);
        System.out.println("Together AI API URL: " + endpoint);
        System.out.println("Payload: " + jsonPayload);

        request.setEntity(new StringEntity(jsonPayload, StandardCharsets.UTF_8));

        try (CloseableHttpClient httpClient = HttpClients.createDefault();
             CloseableHttpResponse response = httpClient.execute(request)) {
            int statusCode = response.getStatusLine().getStatusCode();
            String responseBody = EntityUtils.toString(response.getEntity());
            System.out.println("HTTP Status: " + statusCode);
            System.out.println("Together AI API response: " + responseBody);

            // <think> 태그와 그 안의 내용을 제거 (Java에서는 (?s) 플래그 사용 가능)
            String cleanedResponse = responseBody.replaceAll("(?s)<think>.*?</think>", "").trim();
            System.out.println("Cleaned Together AI API response: " + cleanedResponse);
            return cleanedResponse;
        }
    }
}