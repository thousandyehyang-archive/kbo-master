package com.example.baseball;

import com.example.baseball.api.TogetherAiService;
import com.example.baseball.api.NaverService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/baseball")
public class BaseballServlet extends HttpServlet {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final TogetherAiService togetherAiService = new TogetherAiService();
    private final NaverService naverService = new NaverService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String query = request.getParameter("query");
        System.out.println("Received query in Servlet: " + query);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Hello, Baseball AI!");
        result.put("query", query != null ? query : "no query provided");

        if (query != null && !query.isEmpty()) {
            try {
                System.out.println("Calling TogetherAiService...");
                String togetherAiResponse = togetherAiService.askQuestion(query);
                System.out.println("Calling NaverService...");
                String naverResponse = naverService.getNews(query);
                result.put("togetherAiResponse", togetherAiResponse);
                result.put("naverResponse", naverResponse);
            } catch (Exception e) {
                e.printStackTrace();
                result.put("error", e.getMessage());
            }
        }

        response.setContentType("application/json;charset=UTF-8");
        String jsonResponse = objectMapper.writeValueAsString(result);
        response.getWriter().write(jsonResponse);
    }
}
