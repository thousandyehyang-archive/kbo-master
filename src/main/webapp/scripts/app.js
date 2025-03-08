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
                    items.forEach(item => {
                        const card = document.createElement("div");
                        card.className = "card mb-3";

                        const row = document.createElement("div");
                        row.className = "row g-0";

                        const imgCol = document.createElement("div");
                        imgCol.className = "col-md-4";
                        const img = document.createElement("img");
                        img.className = "img-fluid rounded-start news-img";
                        // item.image 값 사용, 없으면 placeholder 사용
                        img.src = item.image || "https://via.placeholder.com/300x200?text=No+Image";
                        img.alt = "뉴스 이미지";
                        imgCol.appendChild(img);

                        const textCol = document.createElement("div");
                        textCol.className = "col-md-8";
                        const cardBody = document.createElement("div");
                        cardBody.className = "card-body";

                        const title = document.createElement("h5");
                        title.className = "card-title";
                        title.innerHTML = item.title;

                        const description = document.createElement("p");
                        description.className = "card-text";
                        description.innerHTML = item.description;

                        const pubDate = document.createElement("p");
                        pubDate.className = "card-text";
                        const small = document.createElement("small");
                        small.className = "text-muted";
                        small.innerText = item.pubDate;
                        pubDate.appendChild(small);

                        cardBody.appendChild(title);
                        cardBody.appendChild(description);
                        cardBody.appendChild(pubDate);
                        textCol.appendChild(cardBody);
                        row.appendChild(imgCol);
                        row.appendChild(textCol);
                        card.appendChild(row);
                        newsContainer.appendChild(card);
                    });
                } catch (error) {
                    document.getElementById("newsContainer").innerHTML = "<p>뉴스 응답 파싱 실패: " + error + "</p>";
                }
            })
            .catch(error => {
                document.getElementById("togetherResult").innerText = "에러 발생: " + error;
                document.getElementById("newsContainer").innerHTML = "<p>에러 발생: " + error + "</p>";
            });
    });
});
