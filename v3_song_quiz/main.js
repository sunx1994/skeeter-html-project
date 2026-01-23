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
    // 隐藏所有游戏面板
    document.querySelector('header').style.display = 'none';
    document.querySelector('.disk-container').style.display = 'none';
    playPauseBtn.style.display = 'none';
    actionArea.style.display = 'none';
    answerCard.style.display = 'none';
    
    // 显示结算
    resultScreen.style.display = 'block';
    scoreCount.innerText = score;
}

audio.addEventListener('ended', () => {
    isPlaying = false;
    updateVisuals();
    playPauseBtn.querySelector('.text').innerText = "重新听一遍";
    if (!isRevealed) actionArea.style.display = 'block';
});

window.onload = () => loadSong(currentLevel);
