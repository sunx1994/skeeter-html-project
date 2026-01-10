/**
 * Heart-Shaped Diversified Photo Wall Component
 * Sequential spotlight entries with different animations landing in a heart shape.
 */
class PhotoWall {
    constructor(containerId, images, options = {}) {
        this.container = document.getElementById(containerId);
        this.images = images;
        this.options = {
            spotlightDuration: options.spotlightDuration || 1500,
            animDuration: options.animDuration || 1000,
            scale: options.scale || 4.5, // 提高放大倍数，因为基准尺寸变小了
            ...options
        };
        
        this.animTypes = ['spin', 'flip', 'zoom', 'slide'];
        
        if (this.container) {
            this.init();
        }
    }

    async init() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            this.images.forEach((imgData, i) => {
                const item = this.renderPhoto(imgData, true);
                const coords = this.getHeartCoordinates(i, this.images.length);
                item.style.left = coords.x + '%';
                item.style.top = coords.y + '%';
            });
            return;
        }

        // 确保容器有高度
        if (!this.container.style.height && this.container.offsetHeight === 0) {
            this.container.style.height = '600px';
        }

        for (let i = 0; i < this.images.length; i++) {
            await this.processPhoto(this.images[i], i);
        }

        this.triggerFinalEffect();
    }

    renderPhoto(imgData, immediate = false) {
        const item = document.createElement('div');
        item.className = 'photo-item' + (immediate ? ' landed' : '');
        
        const img = document.createElement('img');
        img.src = imgData.url;
        img.alt = imgData.name || 'Photo';
        item.appendChild(img);

        if (imgData.name || imgData.role) {
            const info = document.createElement('div');
            info.className = 'photo-info';
            info.innerHTML = `<strong>${imgData.name || ''}</strong><br>${imgData.role || ''}`;
            item.appendChild(info);
        }
        
        this.container.appendChild(item);
        return item;
    }

    async processPhoto(imgData, index) {
        const item = this.renderPhoto(imgData);
        item.dataset.initialIndex = index; // 记录初始位置索引作为轨道基准
        
        // 1. 随机选择一种入场动画类型
        const animType = this.animTypes[Math.floor(Math.random() * this.animTypes.length)];
        item.classList.add(`entry-${animType}`);
        
        // 初始位置设为屏幕中心（但被 entry 类控制隐藏和偏移）
        item.style.left = '50%';
        item.style.top = '50%';

        // 强制重绘
        item.offsetHeight;

        // 2. 亮相阶段 (Spotlight) - 移向中心并放大
        await this.animateToCenter(item);

        // 3. 停留
        await new Promise(resolve => setTimeout(resolve, this.options.spotlightDuration));

        // 4. 归位到心形位置
        await this.animateToHeart(item, index);
    }

    animateToCenter(item) {
        return new Promise(resolve => {
            // 清除入场类，触发 transition 动画
            this.animTypes.forEach(type => item.classList.remove(`entry-${type}`));
            
            item.classList.add('spotlight');
            item.style.opacity = "1";
            item.style.transform = `translate(-50%, -50%) scale(${this.options.scale}) rotate(0deg)`;
            
            const onEnd = (e) => {
                if (e.propertyName === 'transform') {
                    item.removeEventListener('transitionend', onEnd);
                    resolve();
                }
            };
            item.addEventListener('transitionend', onEnd);
        });
    }

    animateToHeart(item, index) {
        return new Promise(resolve => {
            const coords = this.getHeartCoordinates(index, this.images.length);
            
            item.classList.remove('spotlight');
            item.classList.add('landed');
            
            // 设置心形坐标
            item.style.left = coords.x + '%';
            item.style.top = coords.y + '%';
            
            const onEnd = (e) => {
                if (e.propertyName === 'left' || e.propertyName === 'top') {
                    item.removeEventListener('transitionend', onEnd);
                    resolve();
                }
            };
            item.addEventListener('transitionend', onEnd);
        });
    }

    /**
     * 心形参数方程计算
     * x = 16 * sin^3(t)
     * y = 13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t)
     */
    getHeartCoordinates(index, total) {
        // t 从 0 到 2PI
        const t = (index / total) * 2 * Math.PI;
        
        // 计算原始坐标 (范围大约在 x:[-16,16], y:[-17,13])
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        
        // 将坐标映射到 0-100% 的容器空间
        // 我们稍微缩小倍数让它居中并留出边距
        const scaleX = 2.2; 
        const scaleY = 2.2;
        
        return {
            x: 50 + (x * scaleX),
            y: 45 + (y * scaleY)
        };
    }

    triggerFinalEffect() {
        this.container.classList.add('completed');
        
        // 1. 实现文字逐字闪现
        this.revealMonologue();

        setTimeout(() => {
            const items = this.container.querySelectorAll('.photo-item');
            items.forEach((item, index) => {
                // 延迟触发激活状态，产生波浪感
                setTimeout(() => {
                    item.classList.add('activated');
                }, index * 60);
            });

            // 等待所有照片激活并稳定后，开启轨道滑行
            setTimeout(() => {
                this.startTrackAnimation();
            }, items.length * 60 + 500);
        }, 800);
    }

    revealMonologue() {
        const mono = document.getElementById('monologue');
        if (!mono) return;

        const text = mono.innerText;
        mono.innerHTML = ''; // 清空原文
        
        // 将文字拆解为 span
        const chars = text.split('').map(char => {
            const span = document.createElement('span');
            span.innerText = char;
            mono.appendChild(span);
            return span;
        });

        // 逐字显现
        chars.forEach((span, i) => {
            setTimeout(() => {
                span.classList.add('revealed');
            }, 1500 + i * 400); // 1.5s 后开始，每字间隔 400ms
        });

        // 35秒后消失
        setTimeout(() => {
            mono.classList.add('fade-out');
        }, 35000); 
    }

    startTrackAnimation() {
        const items = Array.from(this.container.querySelectorAll('.photo-item'));
        const total = this.images.length;
        
        // 1. 进入滑行模式
        items.forEach(item => item.classList.add('orbiting'));
        
        let progress = 0;
        let isPaused = false;
        const speed = 0.005; // 基础移动速度

        // 交互：悬停暂停
        this.container.addEventListener('mouseenter', () => {
            isPaused = true;
            this.container.classList.add('paused');
        });
        this.container.addEventListener('mouseleave', () => {
            isPaused = false;
            this.container.classList.remove('paused');
        });

        const move = () => {
            if (!isPaused) {
                progress += speed;
                
                items.forEach(item => {
                    const initialIndex = parseFloat(item.dataset.initialIndex);
                    // 计算当前在该位置的基础上增加的偏移量
                    const currentPos = (initialIndex + progress) % total;
                    const coords = this.getHeartCoordinates(currentPos, total);
                    
                    item.style.left = `${coords.x}%`;
                    item.style.top = `${coords.y}%`;
                });
            }
            
            this.orbitId = requestAnimationFrame(move);
        };
        
        this.orbitId = requestAnimationFrame(move);
    }

    stopAnimation() {
        if (this.orbitId) {
            cancelAnimationFrame(this.orbitId);
        }
    }
}

window.PhotoWall = PhotoWall;
