// 1. 根据你修改后的文件名列出所有音频
const audioFiles = [
    "《Far Away From Home》.mp3",
    "上杉升、织田哲郎《直到世界的尽头》 .mp3",
    "倚天屠龙记 主题曲《心爱》.mp3",
    "周杰伦《告白气球》 .mp3",
    "王菲《世界赠予我的》.mp3",
    "皇后乐队Queen《波西米亚狂想曲》 .mp3",
    "陈楚生《思念一个荒废的名字》.mp3"
];

// 2. 智能解析歌名和歌手
const songResources = audioFiles.map(filename => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "").trim();
    
    // 正则匹配：歌手《歌名》
    const match = nameWithoutExt.match(/(.*?)《(.*?)》/);
    
    let artist = "经典精选";
    let title = nameWithoutExt;

    if (match) {
        artist = match[1].trim() || "经典精选";
        title = match[2].trim();
    } else {
        // 如果只有《歌名》，去掉括号
        title = nameWithoutExt.replace(/《|》/g, "").trim();
    }

    return {
        title: title,
        artist: artist,
        src: `assets/audio/${filename}`,
        cover: "../images/星空.jpg" 
    };
});

// 3. 动态关卡列表
const songList = songResources.map((res, i) => ({
    ...res,
    id: i + 1
}));

const totalLevels = songList.length;

let currentLevel = 0;
let score = 0;
let isPlaying = false;
let isRevealed = false;
let isDragging = false;
const audio = new Audio();

// --- DOM 元素获取 ---
const playPauseBtn = document.getElementById('play-pause-btn');
const disk = document.getElementById('disk');
const needle = document.getElementById('needle');
const actionArea = document.getElementById('action-area');
const answerCard = document.getElementById('answer-card');
const bingoBtn = document.getElementById('bingo-btn');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');
const levelText = document.getElementById('current-level');
const totalLevelsText = document.getElementById('total-levels-text');
const answerTitle = document.getElementById('answer-title');
const answerArtist = document.getElementById('answer-artist');
const songCover = document.getElementById('song-cover');
const resultScreen = document.getElementById('result-screen');
const scoreCount = document.getElementById('score-count');

// 侧边导航按钮
const prevNavBtn = document.getElementById('prev-nav-btn');
const nextNavBtn = document.getElementById('next-nav-btn');

// 进度条相关
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');

// --- 辅助函数 ---

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// --- 核心逻辑函数 ---

function loadSong(index) {
    if (index >= totalLevels) {
        showFinalResult();
        return;
    }
    const song = songList[index];
    audio.src = song.src;
    songCover.src = song.cover;
    
    // 更新进度显示
    levelText.innerText = index + 1;
    if (totalLevelsText) totalLevelsText.innerText = totalLevels;
    
    // UI 重置
    isRevealed = false;
    isPlaying = false;
    answerCard.style.display = 'none';
    actionArea.style.display = 'none';
    playPauseBtn.style.display = 'inline-block';
    playPauseBtn.querySelector('.text').innerText = "开始播放";
    
    // 进度条重置
    progressBar.value = 0;
    currentTimeEl.innerText = "00:00";
    durationTimeEl.innerText = "00:00";
    
    // 更新侧边按钮可用性
    prevNavBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    
    updateVisuals();
}

function updateVisuals() {
    if (isPlaying) {
        disk.classList.add('playing');
        needle.classList.add('playing');
        playPauseBtn.querySelector('.icon').innerText = "⏸";
    } else {
        disk.classList.remove('playing');
        needle.classList.remove('playing');
        playPauseBtn.querySelector('.icon').innerText = "▶";
    }
}

// --- 音频事件监听 ---

audio.addEventListener('loadedmetadata', () => {
    progressBar.max = audio.duration;
    durationTimeEl.innerText = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    if (!isDragging) {
        progressBar.value = audio.currentTime;
        currentTimeEl.innerText = formatTime(audio.currentTime);
    }
});

audio.addEventListener('ended', () => {
    isPlaying = false;
    updateVisuals();
    playPauseBtn.querySelector('.text').innerText = "重新听一遍";
    if (!isRevealed) actionArea.style.display = 'block';
});

// --- 进度条交互 ---

progressBar.addEventListener('input', () => {
    isDragging = true;
    currentTimeEl.innerText = formatTime(progressBar.value);
});

progressBar.addEventListener('change', () => {
    audio.currentTime = progressBar.value;
    isDragging = false;
    if (isPlaying) audio.play();
});

// --- 按钮点击事件 ---

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playPauseBtn.querySelector('.text').innerText = "继续播放";
        if (!isRevealed) actionArea.style.display = 'block';
    } else {
        audio.play().catch(e => {
            console.error("播放失败:", e);
            alert("音频加载失败，请检查路径是否正确！文件名中可能有空格或特殊字符。");
        });
        isPlaying = true;
        playPauseBtn.querySelector('.text').innerText = "暂停去猜";
    }
    updateVisuals();
});

// 侧边导航逻辑
prevNavBtn.addEventListener('click', () => {
    if (currentLevel > 0) {
        currentLevel--;
        loadSong(currentLevel);
    }
});

nextNavBtn.addEventListener('click', () => {
    if (currentLevel < totalLevels - 1) {
        currentLevel++;
        loadSong(currentLevel);
    } else {
        showFinalResult();
    }
});

function revealAnswer(isBingo = false) {
    if (isRevealed) return;
    isRevealed = true;
    
    if (isBingo) {
        score++;
        triggerBingoEffect();
    }
    
    const song = songList[currentLevel];
    answerTitle.innerText = song.title;
    answerArtist.innerText = song.artist;
    
    playPauseBtn.style.display = 'none';
    actionArea.style.display = 'none';
    answerCard.style.display = 'block';
    
    audio.pause();
    isPlaying = false;
    updateVisuals();
}

function triggerBingoEffect() {
    const container = document.getElementById('effect-container');
    const el = document.createElement('div');
    el.className = 'bingo-effect';
    el.innerText = 'BINGO!';
    container.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

bingoBtn.addEventListener('click', () => revealAnswer(true));
revealBtn.addEventListener('click', () => revealAnswer(false));
nextBtn.addEventListener('click', () => {
    currentLevel++;
    loadSong(currentLevel);
});

function showFinalResult() {
    document.querySelector('header').style.display = 'none';
    document.querySelector('.disk-container').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    playPauseBtn.style.display = 'none';
    actionArea.style.display = 'none';
    answerCard.style.display = 'none';
    
    // 同时也隐藏侧边按钮
    prevNavBtn.style.display = 'none';
    nextNavBtn.style.display = 'none';
    
    resultScreen.style.display = 'block';
    scoreCount.innerText = score;
}

window.onload = () => loadSong(currentLevel);
