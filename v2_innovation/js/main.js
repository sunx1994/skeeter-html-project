import { PuzzleManager } from './puzzle.js';

class AudioManager {
    constructor() {
        this.ctx = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.isInitialized = true;
    }

    playSFX(type) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        if (type === 'ignite') {
            osc.frequency.setValueAtTime(440, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const audio = new AudioManager();
    const puzzle = new PuzzleManager();
    
    const startBtn = document.getElementById('start-btn');
    const goOathBtn = document.getElementById('go-oath-btn');
    const introSection = document.getElementById('intro-section');
    const puzzleStage = document.getElementById('puzzle-stage');

    // 初始化拼图
    puzzle.onComplete = () => {
        handleVictory();
    };
    puzzle.init();

    function handleVictory() {
        const board = document.getElementById('puzzle-board');
        const victoryMsg = document.getElementById('victory-message');
        const goOathBtn = document.getElementById('go-oath-btn');

        // 1. 拼图整体特效
        board.classList.add('completed');
        goOathBtn.classList.add('hidden');
        
        // 2. 纸屑庆祝
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // 3. 文字出现动画
        victoryMsg.classList.remove('hidden');
        gsap.from(victoryMsg, { 
            opacity: 0, 
            y: 50, 
            duration: 2, 
            delay: 1.5,
            ease: "power4.out" 
        });

        // 4. 最终按钮逻辑
        document.getElementById('final-enter-btn')?.addEventListener('click', () => {
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
                overlay.style.display = 'block';
                gsap.to(overlay, {
                    opacity: 1,
                    duration: 2,
                    onComplete: () => {
                        window.location.href = 'launch.html';
                    }
                });
            } else {
                window.location.href = 'launch.html';
            }
        });
    }

    // 检查是否刚从宣誓页面回来
    if (localStorage.getItem('huina2026_pending_unlock') === 'true') {
        // 自动切换到拼图舞台
        introSection.classList.add('hidden');
        puzzleStage.classList.remove('hidden');
        puzzleStage.classList.add('active');
        
        // 延迟解锁新碎片，增加仪式感
        setTimeout(() => {
            puzzle.unlockRandom();
            localStorage.removeItem('huina2026_pending_unlock');
        }, 1000);
    }

    // 开启按钮逻辑
    startBtn?.addEventListener('click', () => {
        audio.init();
        audio.playSFX('ignite');

        const tl = gsap.timeline();
        tl.to('#start-btn', { opacity: 0, y: 20, duration: 0.5 })
          .to('#year-display', { scale: 0.8, opacity: 0, duration: 0.8, ease: "power2.in" })
          .add(() => {
              introSection.classList.add('hidden');
              puzzleStage.classList.remove('hidden');
              setTimeout(() => puzzleStage.classList.add('active'), 50);
          })
          .from(puzzleStage, { opacity: 0, y: 30, duration: 1 });
    });

    // 去宣誓逻辑
    goOathBtn?.addEventListener('click', () => {
        window.location.href = 'oath.html';
    });
});
