package com.example.baseball;

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

    // Jackson의 ObjectMapper를 재사용할 수 있도록 인스턴스 변수로 선언
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // 클라이언트 요청 파라미터 'query' 추출 (예: "이정후 선수 최신 뉴스")
        String query = request.getParameter("query");

        // Gemini API나 네이버 검색 API 호출 로직은 추후 구현 (현재는 테스트용 응답)
        Map<String, String> result = new HashMap<>();
        result.put("message", "Hello, Baseball AI!");
        result.put("query", query != null ? query : "no query provided");

        // JSON으로 변환하여 응답 전송
        response.setContentType("application/json;charset=UTF-8");
        String jsonResponse = objectMapper.writeValueAsString(result);
        response.getWriter().write(jsonResponse);
    }

    // 추후 구현: Gemini API 호출 메서드, 네이버 API 호출 메서드 등
}