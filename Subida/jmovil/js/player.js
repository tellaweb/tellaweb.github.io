// js/player.js
(function (window) {
    'use strict';

    // Flags de teclado
    const keys = { left: false, right: false };

    // Sonido de salto
    const jumpSound = new Audio('assets/sounds/jump.mp3');
    jumpSound.volume = 0.5;

    // Listeners de teclado
    window.addEventListener('keydown', e => {
        if (window.quiz?.isActive()) return;
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
        if (e.code === 'Space') window.player.jump();
    });
    window.addEventListener('keyup', e => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    });

    class Player {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 32;
            this.height = 48;
            this.vx = 0;
            this.vy = 0;
            this.speed = 0.2;
            this.onGround = false;
            this.facing = 'right';

            // Sprites
            this.imageRight = new Image();
            this.imageRight.src = 'assets/images/player-right.png';
            this.loadedRight = false;
            this.imageRight.onload = () => this.loadedRight = true;

            this.imageLeft = new Image();
            this.imageLeft.src = 'assets/images/player-left.png';
            this.loadedLeft = false;
            this.imageLeft.onload = () => this.loadedLeft = true;

            // Exponer en window
            window.player = this;
        }

        clearInput() {
            this.vx = 0;
            keys.left = keys.right = false;
        }

        update(dt) {
            // 1) Orientación
            if (keys.left || window.touchLeft) this.facing = 'left';
            else if (keys.right || window.touchRight) this.facing = 'right';

            // 2) Movimiento horizontal
            if (keys.left || window.touchLeft) this.vx = -this.speed;
            else if (keys.right || window.touchRight) this.vx = this.speed;
            else this.vx = 0;

            // 3) Aplicar movimiento horizontal + wrap
            this.x += this.vx * dt;
            if (this.x > window.canvas.width) this.x = -this.width;
            else if (this.x + this.width < 0) this.x = window.canvas.width;

            // 4) Gravedad
            this.vy += 0.001 * dt;
            console.log('vy:', this.vy.toFixed(3), 'y:', this.y.toFixed(1));
            const prevY = this.y;
            this.y += this.vy * dt;

            // 5) Colisiones con plataformas
            this.onGround = false;
            let standPlat = null;
            for (let p of window.tileset.getAll()) {
                // Sin solapamiento horizontal
                if (this.x + this.width <= p.x || this.x >= p.x + p.width) continue;

                // Choque cabeza
                if (this.vy < 0 &&
                    prevY >= p.y + p.height &&
                    this.y <= p.y + p.height) {
                    this.y = p.y + p.height;
                    this.vy = 0;
                }

                // Choque pies
                if (this.vy >= 0 &&
                    prevY + this.height <= p.y &&
                    this.y + this.height >= p.y) {
                    this.y = p.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    standPlat = p;
                    break;
                }
            }

            // 6) Plataforma móvil
            if (this.onGround && standPlat?.type === 'moving') {
                this.x += standPlat.vx * dt;
                if (this.x > window.canvas.width) this.x = -this.width;
                else if (this.x + this.width < 0) this.x = window.canvas.width;
            }
        }

        draw(ctx) {
            const img = this.facing === 'left' ? this.imageLeft : this.imageRight;
            const loaded = this.facing === 'left' ? this.loadedLeft : this.loadedRight;

            if (loaded) {
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = '#3a5f0b';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }

        jump() {
            if (!this.onGround) return;
            console.log('>>> SALTO ejecutado (onGround antes):', this.onGround);
            jumpSound.currentTime = 0;
            jumpSound.play().catch(() => { });
            this.vy = -0.6;
            console.log('>>> vy tras salto:', this.vy);
            this.onGround = false;
        }
    }

    // Crear el jugador en la posición inicial
    new Player(
        window.canvas.width / 2 - 16,
        window.canvas.height - 50 - 48
    );

})(window);



  

