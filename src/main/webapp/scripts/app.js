document.addEventListener("DOMContentLoaded", function() {
    // 엘리먼트 참조
    const askBtn = document.getElementById("askBtn");
    const queryInput = document.getElementById("queryInput");
    const togetherResult = document.getElementById("togetherResult");
    const newsContainer = document.getElementById("newsContainer");
    const playerStatsGrid = document.getElementById("playerStatsGrid");
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    // 테마 전환 기능
    themeToggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            themeIcon.textContent = "light_mode";
            localStorage.setItem("theme", "dark");
        } else {
            themeIcon.textContent = "dark_mode";
            localStorage.setItem("theme", "light");
        }
    });

    // 저장된 테마 적용
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeIcon.textContent = "light_mode";
    }

    // 스크롤 애니메이션
    function revealOnScroll() {
        const reveals = document.querySelectorAll(".reveal");

        reveals.forEach(reveal => {
            const windowHeight = window.innerHeight;
            const elementTop = reveal.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // 초기 로드 시 실행

    // 선수 통계 렌더링 함수
    function renderPlayerStats(playerData) {
        playerStatsGrid.innerHTML = "";

        // 실제로는 AI 응답에서 통계 데이터를 추출하거나 처리해야 합니다
        // 이 예시에서는 가상의 통계를 생성합니다
        if (!playerData || typeof playerData !== 'string') {
            return;
        }

        // 텍스트에서 숫자 추출 시도
        const stats = [];
        const batAvgMatch = playerData.match(/타율[^\d]*(0\.\d+)/);
        if (batAvgMatch) stats.push({label: "타율", value: batAvgMatch[1]});

        const homeRunMatch = playerData.match(/홈런[^\d]*(\d+)/);
        if (homeRunMatch) stats.push({label: "홈런", value: homeRunMatch[1]});

        const rbiMatch = playerData.match(/타점[^\d]*(\d+)/);
        if (rbiMatch) stats.push({label: "타점", value: rbiMatch[1]});

        const hitsMatch = playerData.match(/안타[^\d]*(\d+)/);
        if (hitsMatch) stats.push({label: "안타", value: hitsMatch[1]});

        const eraMatch = playerData.match(/평균자책[^\d]*([\d\.]+)/);
        if (eraMatch) stats.push({label: "평균자책", value: eraMatch[1]});

        const winsMatch = playerData.match(/승리[^\d]*(\d+)/);
        if (winsMatch) stats.push({label: "승리", value: winsMatch[1]});

        // 통계 카드 생성
        if (stats.length > 0) {
            stats.forEach(stat => {
                const statCard = document.createElement("div");
                statCard.className = "stat-card";
                statCard.innerHTML = `
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                `;
                playerStatsGrid.appendChild(statCard);
            });
        }
    }

    // 검색 버튼 클릭 이벤트
    askBtn.addEventListener("click", function() {
        const query = queryInput.value;
        if (!query.trim()) {
            showNotification("궁금한 선수의 이름을 입력해주세요!", "warning");
            return;
        }

        // 절대 경로 사용
        const url = "baseball?query=" + encodeURIComponent(query);

        // 결과 영역 초기화 및 로딩 표시
        togetherResult.innerText = "";
        const togetherLoader = document.createElement("div");
        togetherLoader.className = "loader";
        togetherResult.parentNode.insertBefore(togetherLoader, togetherResult);

        newsContainer.innerHTML = "";
        const newsLoader = document.createElement("div");
        newsLoader.className = "loader";
        newsContainer.appendChild(newsLoader);

        // 타이핑 효과를 위한 함수
        function typeText(element, text, speed = 10) {
            let i = 0;
            element.innerHTML = "";

            function typing() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(typing, speed);
                }
            }

            typing();
        }

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.status);
                }
                return response.json();
            })
            .then(data => {
                // 로더 제거
                togetherLoader.remove();
                newsLoader.remove();

                // Together AI 응답 처리
                let togetherData;
                try {
                    togetherData = JSON.parse(data.togetherAiResponse);
                } catch (err) {
                    togetherData = { error: "Together AI 응답 파싱 실패" };
                }

                let aiMessage = "";
                if (togetherData.choices && togetherData.choices.length > 0 && togetherData.choices[0].message) {
                    // <think> 태그 제거 처리
                    aiMessage = togetherData.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
                } else if (togetherData.error) {
                    aiMessage = "Error: " + togetherData.error.message;
                } else {
                    aiMessage = "Together AI 응답이 없습니다.";
                }

                // 타이핑 효과 적용 및 선수 정보 표시
                typeText(togetherResult, aiMessage);
                // 선수 통계 렌더링 함수 호출 (AI 응답에서 통계 데이터를 추출)
                renderPlayerStats(aiMessage);

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
                    const fallbackImage = "https://www.tving.com/img/kbo/meta/kbo_meta_share.png";

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
                // 로더 제거
                togetherLoader.remove();
                newsLoader.remove();
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
