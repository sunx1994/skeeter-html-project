// 模拟歌曲数据 (实际使用时可以替换为你的曲子)
const songList = [
    { id: 1, title: "开场史诗感", artist: "Unknown", src: "../audio/1-Cinematic Adventure Epic Trailer.mp3", cover: "../images/星空.jpg" },
    { id: 2, title: "欢快小提琴", artist: "Unknown", src: "../audio/2-Happy Epic Violins.mp3", cover: "../images/飞驰的草地.jpg" },
    // 可以继续添加更多...
];

let currentLevel = 0;
let isPlaying = false;
const audio = new Audio();

// DOM 元素
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

// 初始化第一首歌
function loadSong(index) {
    const song = songList[index];
    audio.src = song.src;
    songCover.src = song.cover;
    levelText.innerText = index + 1;
    
    // 重置界面状态
    answerCard.style.display = 'none';
    actionArea.style.display = 'none';
    playPauseBtn.style.display = 'inline-block';
    playPauseBtn.querySelector('.text').innerText = "开始播放";
    isPlaying = false;
    updateVisuals();
}

function updateVisuals() {
    if (isPlaying) {
        disk.classList.add('playing');
        needle.classList.add('playing');
        playPauseBtn.querySelector('.icon').innerText = "⏸";
        playPauseBtn.querySelector('.text').innerText = "暂停（让人猜）";
    } else {
        disk.classList.remove('playing');
        needle.classList.remove('playing');
        playPauseBtn.querySelector('.icon').innerText = "▶";
    }
}

// 播放/暂停控制
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        // 暂停后显示操作区
        actionArea.style.display = 'block';
        playPauseBtn.style.display = 'none';
    } else {
        audio.play().catch(e => console.log("播放失败，请确保音频路径正确", e));
        isPlaying = true;
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
    
    // 自动移除
    setTimeout(() => el.remove(), 1000);
}

// 答对了按钮
bingoBtn.addEventListener('click', () => {
    triggerBingoEffect();
    showAnswer();
});

// 揭晓答案
revealBtn.addEventListener('click', () => {
    showAnswer();
});

function showAnswer() {
    const song = songList[currentLevel];
    answerTitle.innerText = song.title;
    answerArtist.innerText = song.artist;
    
    actionArea.style.display = 'none';
    answerCard.style.display = 'block';
}

// 下一首
nextBtn.addEventListener('click', () => {
    currentLevel++;
    if (currentLevel < songList.length) {
        loadSong(currentLevel);
    } else {
        alert("恭喜完成所有挑战！");
        currentLevel = 0;
        loadSong(currentLevel);
    }
});

// 页面加载完成后初始化
window.onload = () => {
    loadSong(currentLevel);
};
