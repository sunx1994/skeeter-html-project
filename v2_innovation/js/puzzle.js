export class PuzzleManager {
    constructor() {
        this.cols = 3;
        this.rows = 2;
        this.totalPieces = this.cols * this.rows;
        this.container = document.getElementById('puzzle-board');
        this.storageKey = 'huina2026_puzzle_state';
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = '';
        const state = this.loadState();
        
        for (let i = 0; i < this.totalPieces; i++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.id = `piece-${i}`;
            
            // 计算背景偏移 (3x2 布局)
            const r = Math.floor(i / this.cols);
            const c = i % this.cols;
            
            // 计算百分比: 0, 50%, 100% (对于3列) / 0, 100% (对于2行)
            const xPercent = (c / (this.cols - 1)) * 100;
            const yPercent = (r / (this.rows - 1)) * 100;
            
            piece.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
            
            if (state.includes(i)) {
                piece.classList.add('revealed');
            }
            
            this.container.appendChild(piece);
        }
        this.updateUI();
    }

    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : [];
    }

    // 解锁一个特定的碎片
    revealPiece(index) {
        let state = this.loadState();
        if (!state.includes(index)) {
            state.push(index);
            localStorage.setItem(this.storageKey, JSON.stringify(state));
            
            const piece = document.getElementById(`piece-${index}`);
            if (piece) {
                piece.classList.add('revealed');
                // 简单的解锁动效
                gsap.from(piece, { scale: 1.5, filter: 'brightness(3)', duration: 0.8 });
            }
            this.updateUI();
        }
    }

    // 随机解锁一个未解锁的碎片
    unlockRandom() {
        const state = this.loadState();
        if (state.length >= this.totalPieces) return null;

        let available = [];
        for (let i = 0; i < this.totalPieces; i++) {
            if (!state.includes(i)) available.push(i);
        }

        const randomIndex = available[Math.floor(Math.random() * available.length)];
        this.revealPiece(randomIndex);
        return randomIndex;
    }

    updateUI() {
        const count = this.loadState().length;
        const percent = Math.floor((count / this.totalPieces) * 100);
        const text = document.getElementById('completion-text');
        const fill = document.getElementById('progress-fill');
        
        if (text) text.innerText = `已集合 ${count}/${this.totalPieces} 位先锋誓言`;
        if (fill) fill.style.width = `${percent}%`;

        // 如果全部完成，触发回调
        if (count === this.totalPieces && this.onComplete) {
            this.onComplete();
        }
    }
}

