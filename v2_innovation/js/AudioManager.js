/**
 * Web Audio API 管理器 (ES 模块版)
 */
export class AudioManager {
    constructor() {
        if (AudioManager.instance) return AudioManager.instance;
        this.ctx = null;
        this.isInitialized = false;
        AudioManager.instance = this;
    }

    init() {
        if (this.isInitialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.isInitialized = true;
    }

    playSFX(type) {
        if (!this.ctx) this.init();
        
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

