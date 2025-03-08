document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("askBtn").addEventListener("click", function() {
        const query = document.getElementById("queryInput").value;
        if (!query.trim()) {
            alert("질문을 입력해 주세요.");
            return;
        }
        const url = "baseball?query=" + encodeURIComponent(query);
        document.getElementById("togetherResult").innerText = "로딩 중...";
        document.getElementById("newsContainer").innerHTML = "<p>로딩 중...</p>";

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
                    aiMessage = togetherData.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
                } else if (togetherData.error) {
                    aiMessage = "Error: " + togetherData.error.message;
                } else {
                    aiMessage = "Together AI 응답이 없습니다.";
                }
                document.getElementById("togetherResult").innerText = aiMessage;

                // 네이버 뉴스 응답 처리
                try {
                    const newsJson = JSON.parse(data.naverResponse);
                    const items = newsJson.items;
                    const newsContainer = document.getElementById("newsContainer");
                    newsContainer.innerHTML = "";

                    if (items.length === 0) {
                        newsContainer.innerHTML = "<p class='text-center'>관련 뉴스가 없습니다.</p>";
                        return;
                    }

                    items.forEach(item => {
                        // 새로운 뉴스 아이템 카드 생성
                        const newsItem = document.createElement("div");
                        newsItem.className = "news-item-card mb-3";

                        // 카드 내부 구조 생성
                        newsItem.innerHTML = `
                            <div class="row g-0">
                                <div class="col-md-3">
                                    <img src="${item.image || "/api/placeholder/300/200"}" 
                                         alt="뉴스 이미지" 
                                         class="news-thumbnail">
                                </div>
                                <div class="col-md-9">
                                    <div class="news-content">
                                        <h5 class="news-title">${item.title}</h5>
                                        <p class="news-description">${item.description}</p>
                                        <p class="news-date">${item.pubDate}</p>
                                        <a href="${item.link}" target="_blank" class="news-link">기사 읽기</a>
                                    </div>
                                </div>
                            </div>
                        `;

                        newsContainer.appendChild(newsItem);
                    });
                } catch (error) {
                    document.getElementById("newsContainer").innerHTML =
                        `<div class="alert alert-danger">뉴스 응답 파싱 실패: ${error}</div>`;
                }
            })
            .catch(error => {
                document.getElementById("togetherResult").innerText = "에러 발생: " + error;
                document.getElementById("newsContainer").innerHTML =
                    `<div class="alert alert-danger">에러 발생: ${error}</div>`;
            });
    });

    // Enter 키로 검색 실행
    document.getElementById("queryInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("askBtn").click();
        }
    });
});