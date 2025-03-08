document.addEventListener("DOMContentLoaded", function() {
    const askBtn = document.getElementById("askBtn");
    const queryInput = document.getElementById("queryInput");
    const togetherResult = document.getElementById("togetherResult");
    const newsContainer = document.getElementById("newsContainer");

    askBtn.addEventListener("click", function() {
        const query = queryInput.value;
        if (!query.trim()) {
            alert("궁금한 선수의 이름을 입력해주세요!");
            return;
        }
        // 절대 경로 사용 (만약 컨텍스트 경로가 /kbo-master이면 "/kbo-master/baseball"으로 수정)
        const url = "baseball?query=" + encodeURIComponent(query);

        // 결과 영역 초기화
        togetherResult.innerText = "로딩 중...";
        newsContainer.innerHTML = "<p class='text-center text-muted'>로딩 중...</p>";

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.status);
                }
                return response.json();
            })
            .then(data => {
                // Together AI 응답 처리
                let togetherData;
                try {
                    togetherData = JSON.parse(data.togetherAiResponse);
                } catch (err) {
                    togetherData = { error: "Together AI 응답 파싱 실패" };
                }
                let aiMessage = "";
                if (togetherData.choices && togetherData.choices.length > 0 && togetherData.choices[0].message) {
                    // <think> 태그 제거 처리: 모든 문자를 매칭하는 정규식
                    aiMessage = togetherData.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
                } else if (togetherData.error) {
                    aiMessage = "Error: " + togetherData.error.message;
                } else {
                    aiMessage = "Together AI 응답이 없습니다.";
                }
                togetherResult.innerText = aiMessage;

                // 네이버 뉴스 응답 처리
                try {
                    const newsJson = JSON.parse(data.naverResponse);
                    const items = newsJson.items;
                    newsContainer.innerHTML = ""; // 초기화

                    if (!items || items.length === 0) {
                        newsContainer.innerHTML = "<p class='text-center text-muted'>관련 뉴스가 없습니다.</p>";
                        return;
                    }

                    // fallback 이미지 URL (절대 URL)
                    const fallbackImage = "https://via.placeholder.com/300x200?text=No+Image";

                    items.forEach(item => {
                        // 뉴스 카드 생성
                        const newsItem = document.createElement("div");
                        newsItem.className = "news-item-card mb-3";

                        // 카드 내부 구조
                        newsItem.innerHTML = `
              <div class="row g-0">
                <div class="col-md-3">
                  <img src="${item.image || fallbackImage}" 
                       alt="뉴스 이미지" 
                       class="news-thumbnail img-fluid rounded-start">
                </div>
                <div class="col-md-9">
                  <div class="news-content p-3">
                    <h5 class="news-title">${item.title}</h5>
                    <p class="news-description">${item.description}</p>
                    <p class="news-date"><small class="text-muted">${item.pubDate}</small></p>
                    <a href="${item.link}" target="_blank" class="news-link">기사 읽기</a>
                  </div>
                </div>
              </div>
            `;

                        newsContainer.appendChild(newsItem);
                    });
                } catch (error) {
                    newsContainer.innerHTML = `<div class="alert alert-danger">뉴스 응답 파싱 실패: ${error}</div>`;
                }
            })
            .catch(error => {
                togetherResult.innerText = "에러 발생: " + error;
                newsContainer.innerHTML = `<div class="alert alert-danger">에러 발생: ${error}</div>`;
            });
    });

    // Enter 키로 검색 실행
    queryInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            askBtn.click();
        }
    });
});