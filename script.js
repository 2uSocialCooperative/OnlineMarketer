const API_KEY = "AIzaSyAenyiZAKY8H7nT1uRNHv9AFlq1P5xzGi4";
let currentVideoIndex = 0; // 현재 표시 중인 영상 인덱스
let videos = []; // 검색된 영상들의 목록
let bestVideos = []; // "Best" 비디오들을 저장하는 배열
let badVideos = []; // "Bad" 비디오들을 저장하는 배열

function searchVideos() {
    const query = document.getElementById("searchQuery").value;
    const maxResults = document.getElementById("videoCount").value;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${API_KEY}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            videos = data.items; // 검색된 영상 리스트 저장
            currentVideoIndex = 0; // 첫 번째 영상부터 시작
            bestVideos = []; // Best 비디오 배열 초기화
            badVideos = []; // Bad 비디오 배열 초기화
            showVideo(currentVideoIndex); // 첫 번째 영상 표시

            // <h2> 태그로 "어떤 썸네일이 Best인가요?" 추가
            addBestThumbnailMessage();
        })
        .catch((error) => console.error("Error fetching data:", error));
}

// 특정 인덱스의 영상을 화면에 표시
function showVideo(index) {
    const videoResults = document.getElementById("videoResults");
    videoResults.innerHTML = ""; // 이전 결과 초기화

    const item = videos[index];
    const videoId = item.id.videoId;
    const videoTitle = item.snippet.title;
    const videoThumbnail = item.snippet.thumbnails.high.url; // 썸네일 크기 변경

    // 영상 정보 표시 (썸네일만 출력)
    const videoElement = document.createElement("div");
    videoElement.classList.add("video-item");
    videoElement.innerHTML = `
        <h3> 영상 제목 : ${videoTitle}</h3>
        <img src="${videoThumbnail}" alt="${videoTitle}" style="width: 100%; height: 400px; object-fit: cover; border: none; padding: 0; margin: 0;">
        <div class="rating-buttons">
            <button onclick="rateVideo('${videoId}', 'Best')">Best</button>
            <button onclick="rateVideo('${videoId}', 'Bad')">Bad</button>
        </div>
        <div id="feedback"></div> <!-- 피드백 메시지 위치 -->
        <button id="nextButton" onclick="showNextVideo()" style="display: none;">Next</button> <!-- Next 버튼 숨김 -->
    `;
    videoResults.appendChild(videoElement);
}

// <h2> 태그로 "어떤 썸네일이 Best인가요?" 문구 추가 함수
function addBestThumbnailMessage() {
    // 이미 문구가 있다면 중복되지 않도록 제거
    const existingMessage = document.getElementById("bestThumbnailMessage");
    if (existingMessage) {
        existingMessage.remove();
    }

    // 새로운 <h2> 태그 생성
    const messageElement = document.createElement("h2");
    messageElement.id = "bestThumbnailMessage"; // ID 추가하여 중복 방지
    messageElement.textContent = "어떤 썸네일이 Best인가요?";
    messageElement.style.textAlign = "center"; // 가운데 정렬

    // 검색 결과 위에 문구를 삽입
    const videoResults = document.getElementById("videoResults");
    videoResults.insertAdjacentElement("beforebegin", messageElement);
}

// 비디오 평가 (Best/Bad)를 처리하는 함수
function rateVideo(videoId, rating) {
    const video = videos[currentVideoIndex];

    if (rating === "Best") {
        // Best로 평가된 비디오 저장
        bestVideos.push({
            videoId,
            videoTitle: video.snippet.title,
            videoThumbnail: video.snippet.thumbnails.high.url,
        });
        // "맞았습니다!" 메시지 표시
        document.getElementById("feedback").innerHTML =
            '<p style="color: green; text-align: center;font-size: 32px; font-weight: bold;">맞았습니다!👏💯</p>';
        // Next 버튼 표시
        document.getElementById("nextButton").style.display = "block";
    } else if (rating === "Bad") {
        // Bad로 평가된 비디오 저장
        badVideos.push({
            videoId,
            videoTitle: video.snippet.title,
            videoThumbnail: video.snippet.thumbnails.high.url,
        });
        // "틀렸습니다!" 메시지 표시
        document.getElementById("feedback").innerHTML =
            '<p style="color: red; text-align: center;font-size: 32px; font-weight: bold;">틀렸습니다!😵</p>';
        // Next 버튼 표시
        document.getElementById("nextButton").style.display = "block";
    }

    // Best와 Bad 버튼 숨기기
    const ratingButtons = document.querySelector(".rating-buttons");
    if (ratingButtons) {
        ratingButtons.style.display = "none";
    }
}

// 다음 비디오로 넘어가는 함수
function showNextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % videos.length; // 마지막 영상 다음은 첫 번째 영상으로
    if (currentVideoIndex === 0) {
        // 모든 비디오를 다 평가하면 Best 비디오 페이지로 이동
        displayBestVideos();
    } else {
        showVideo(currentVideoIndex);
    }
}

// Best 비디오를 출력하는 페이지로 이동
function displayBestVideos() {
    // Best와 Bad 비디오 배열을 로컬 스토리지에 저장
    localStorage.setItem("bestVideos", JSON.stringify(bestVideos));
    localStorage.setItem("badVideos", JSON.stringify(badVideos));

    window.location.href = "bestVideos.html"; // bestVideos.html 페이지로 이동
}
