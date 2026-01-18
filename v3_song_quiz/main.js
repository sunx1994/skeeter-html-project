// 歌曲资源定义
const songResources = [
    { title: "史诗冒险", artist: "Epic Trailer", src: "../audio/1-Cinematic Adventure Epic Trailer.mp3", cover: "../images/星空.jpg" },
    { title: "欢快节奏", artist: "Happy Violins", src: "../audio/2-Happy Epic Violins.mp3", cover: "../images/飞驰的草地.jpg" }
];

// 生成10个关卡的数据 (循环使用现有资源)
const songList = Array.from({ length: 10 }, (_, i) => ({
    ...songResources[i % songResources.length],
    id: i + 1
}));

let currentLevel = 0;
let score = 0;
let isPlaying = false;
let isRevealed = false;
const audio = new Audio();

// 获取 DOM 元素
const playPauseBtn = document.getElementById('play-pause-btn');
const disk = document.getElementById('disk');
const needle = document.getElementById('needle');
const actionArea = document.getElementById('action-area');
const answerCard = document.getElementById('answer-card');
const bingoBtn = document.getElementById('bingo-btn');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');
const levelText = document.getElementById('current-level');
const answerTitle = document.getElementById('answer-title');
const answerArtist = document.getElementById('answer-artist');
const songCover = document.getElementById('song-cover');
const resultScreen = document.getElementById('result-screen');
const scoreCount = document.getElementById('score-count');

// 加载关卡
function loadSong(index) {
    if (index >= songList.length) {
        showFinalResult();
        return;
    }
    const song = songList[index];
    audio.src = song.src;
    songCover.src = song.cover;
    levelText.innerText = index + 1;
    
    // UI 状态重置
    isRevealed = false;
    isPlaying = false;
    answerCard.style.display = 'none';
    actionArea.style.display = 'none';
    playPauseBtn.style.display = 'inline-block';
    playPauseBtn.querySelector('.text').innerText = "开始播放";
    
    updateVisuals();
}

// 视觉反馈更新
function updateVisuals() {
    if (isPlaying) {
        disk.classList.add('playing');
        needle.classList.add('playing');
        playPauseBtn.querySelector('.icon').innerText = "⏸";
        // 播放中也可以让文字变一变
        if (playPauseBtn.querySelector('.text').innerText === "开始播放" || 
            playPauseBtn.querySelector('.text').innerText === "继续播放") {
            playPauseBtn.querySelector('.text').innerText = "暂停去猜";
        }
    } else {
        disk.classList.remove('playing');
        needle.classList.remove('playing');
        playPauseBtn.querySelector('.icon').innerText = "▶";
    }
}

// 播放/暂停/继续逻辑
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playPauseBtn.querySelector('.text').innerText = "继续播放";
        // 第一次暂停后，显示猜歌操作区
        if (!isRevealed) {
            actionArea.style.display = 'block';
        }
    } else {
        audio.play().catch(e => console.log("播放失败，请检查音频路径", e));
        isPlaying = true;
        playPauseBtn.querySelector('.text').innerText = "暂停去猜";
    }
    updateVisuals();
});

// Bingo 特效
function triggerBingoEffect() {
    const effectContainer = document.getElementById('effect-container');
    const el = document.createElement('div');
    el.className = 'bingo-effect';
    el.innerText = 'BINGO!';
    effectContainer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// 处理揭晓（Bingo 或 直接揭晓）
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
    
    // 隐藏播放按钮和操作区
    playPauseBtn.style.display = 'none';
    actionArea.style.display = 'none';
    
    // 显示结果卡片
    answerCard.style.display = 'block';
    
    // 揭晓后停止音乐
    audio.pause();
    isPlaying = false;
    updateVisuals();
}

bingoBtn.addEventListener('click', () => revealAnswer(true));
revealBtn.addEventListener('click', () => revealAnswer(false));

// 下一首逻辑
nextBtn.addEventListener('click', () => {
    currentLevel++;
    loadSong(currentLevel);
});

// 最终结算展示
function showFinalResult() {
    // 隐藏所有游戏元素
    document.querySelector('header').style.display = 'none';
    disk.parentElement.style.display = 'none';
    playPauseBtn.style.display = 'none';
    actionArea.style.display = 'none';
    answerCard.style.display = 'none';
    
    // 显示结算
    resultScreen.style.display = 'block';
    scoreCount.innerText = score;
}

// 自动切换逻辑 (如果音乐播完了还没猜对)
audio.addEventListener('ended', () => {
    isPlaying = false;
    updateVisuals();
    playPauseBtn.querySelector('.text').innerText = "重新听一遍";
    // 如果还没揭晓，显示操作区
    if (!isRevealed) {
        actionArea.style.display = 'block';
    }
});

// 页面加载完成后初始化
window.onload = () => {
    loadSong(currentLevel);
};
