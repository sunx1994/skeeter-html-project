import * as THREE from 'three';

/**
 * CyberHorse - 一个用代码构建的数字化科技马
 * 采用低多边形+霓虹边框风格，适合科技感主题
 */
export class CyberHorse {
    constructor() {
        this.group = new THREE.Group();
        this.parts = {};
        this.createModel();
    }

    createModel() {
        const material = new THREE.MeshBasicMaterial({
            color: 0x00f2ff,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });

        // 身体
        const bodyGeo = new THREE.BoxGeometry(2, 1, 0.8);
        this.parts.body = new THREE.Mesh(bodyGeo, material);
        this.group.add(this.parts.body);

        // 脖子
        const neckGeo = new THREE.BoxGeometry(0.5, 1.2, 0.5);
        this.parts.neck = new THREE.Mesh(neckGeo, material);
        this.parts.neck.position.set(1, 0.8, 0);
        this.parts.neck.rotation.z = -0.5;
        this.group.add(this.parts.neck);

        // 头部
        const headGeo = new THREE.BoxGeometry(0.8, 0.5, 0.5);
        this.parts.head = new THREE.Mesh(headGeo, material);
        this.parts.head.position.set(1.4, 1.4, 0);
        this.group.add(this.parts.head);

        // 四条腿
        const legGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3);
        const legPositions = [
            { name: 'legFR', pos: [0.7, -0.8, 0.3] },  // 前右
            { name: 'legFL', pos: [0.7, -0.8, -0.3] }, // 前左
            { name: 'legBR', pos: [-0.7, -0.8, 0.3] }, // 后右
            { name: 'legBL', pos: [-0.7, -0.8, -0.3] } // 后左
        ];

        legPositions.forEach(cfg => {
            const legGroup = new THREE.Group();
            const leg = new THREE.Mesh(legGeo, material);
            leg.position.y = -0.6; // 将旋转中心移到顶部
            legGroup.add(leg);
            legGroup.position.set(...cfg.pos);
            this.parts[cfg.name] = legGroup;
            this.group.add(legGroup);
        });

        // 尾巴
        const tailGeo = new THREE.BoxGeometry(0.8, 0.2, 0.2);
        this.parts.tail = new THREE.Mesh(tailGeo, material);
        this.parts.tail.position.set(-1.2, 0.4, 0);
        this.parts.tail.rotation.z = 0.5;
        this.group.add(this.parts.tail);

        // 初始缩放
        this.group.scale.set(1.5, 1.5, 1.5);
    }

    /**
     * 奔跑动画逻辑
     * @param {number} time 时间戳
     * @param {number} speed 奔跑速度
     */
    update(time, speed = 1) {
        const cycle = time * 10 * speed;
        
        // 腿部交叉摆动
        this.parts.legFR.rotation.z = Math.sin(cycle) * 0.5;
        this.parts.legBL.rotation.z = Math.sin(cycle) * 0.5;
        
        this.parts.legFL.rotation.z = Math.sin(cycle + Math.PI) * 0.5;
        this.parts.legBR.rotation.z = Math.sin(cycle + Math.PI) * 0.5;

        // 身体轻微起伏
        this.parts.body.position.y = Math.sin(cycle * 2) * 0.1;
        this.parts.head.position.y = 1.4 + Math.sin(cycle * 2) * 0.05;

        // 尾巴摆动
        this.parts.tail.rotation.y = Math.sin(cycle) * 0.3;
    }

    /**
     * 长出翅膀
     */
    growWings() {
        const wingMat = new THREE.MeshBasicMaterial({
            color: 0x00f2ff,
            wireframe: true,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });

        const wingGeo = new THREE.PlaneGeometry(3, 2);
        // 右翅膀
        this.parts.wingR = new THREE.Mesh(wingGeo, wingMat);
        this.parts.wingR.position.set(-0.5, 1, 0.4);
        this.parts.wingR.rotation.set(Math.PI/4, Math.PI/4, 0);
        
        // 左翅膀
        this.parts.wingL = new THREE.Mesh(wingGeo, wingMat);
        this.parts.wingL.position.set(-0.5, 1, -0.4);
        this.parts.wingL.rotation.set(-Math.PI/4, Math.PI/4, 0);

        this.group.add(this.parts.wingR, this.parts.wingL);
    }
}

