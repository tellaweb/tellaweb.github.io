// js/player.js
(function (window) {
    'use strict';

    const DEBUG = false;

    // Obtener canvas (compatibilidad con window.Game o window.canvas)
    const canvas = (window.Game && window.Game.canvas) || window.canvas;
    if (!canvas) {
        console.error('player.js: canvas no encontrado. Asegura que init.js se ejecutó antes.');
        return;
    }

    // Input
    const keys = { left: false, right: false, jump: false };
    
    // // Sonido de salto
    const jumpSound = new Audio('assets/sounds/jump.mp3');
    jumpSound.volume = 0;
    jumpSound.muted = true;
    const btn = document.getElementById('muteToggle');
    btn.addEventListener('click', () => {
        if (jumpSound.volume == 0) {
            
            jumpSound.volume = 1;
             jumpSound.muted = false;
        }
         else {
            
            jumpSound.volume = 0;
            jumpSound.muted = true;
     }
    })

    // Física (px / ms)
    const SPEED = 0.28;
    const GRAVITY = 0.0016;
    const JUMP_VELOCITY = 0.67;

    // Listeners teclado
    window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
        if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
            if (!keys.jump) {
                keys.jump = true;
                if (window.player && typeof window.player.jump === 'function') window.player.jump();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
        if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') keys.jump = false;
    });

    class Player {
        constructor(x, y) {
            this.x = typeof x === 'number' ? x : (canvas.width / 2 - 16);
            this.y = typeof y === 'number' ? y : (canvas.height - 50 - 48);
            this.width = 32;
            this.height = 48;
            this.vx = 0;
            this.vy = 0;
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

            // Exponer
            window.player = this;
            window.Game = window.Game || {};
            window.Game.player = this;
        }

        clearInput() {
            this.vx = 0;
            keys.left = keys.right = keys.jump = false;
            if (window.touchLeft) window.touchLeft = false;
            if (window.touchRight) window.touchRight = false;
            if (window.touchJump) window.touchJump = false;
        }

        update(dt) {
            if (!dt) return;

            // 1) Orientación
            if (keys.left || window.touchLeft) this.facing = 'left';
            else if (keys.right || window.touchRight) this.facing = 'right';

            // 2) Movimiento horizontal
            if (keys.left || window.touchLeft) this.vx = -SPEED;
            else if (keys.right || window.touchRight) this.vx = SPEED;
            else this.vx = 0;

            // 3) Guardamos posiciones previas para detección por trazos
            const prevTop = this.y;
            const prevBottom = this.y + this.height;

            // 4) Aplicar desplazamiento horizontal
            this.x += this.vx * dt;
            if (this.x > canvas.width) this.x = -this.width;
            else if (this.x + this.width < 0) this.x = canvas.width;

            // 5) Gravedad y movimiento vertical
            this.vy += GRAVITY * dt;
            this.y += this.vy * dt;

            const newTop = this.y;
            const newBottom = this.y + this.height;

            if (DEBUG) {
                console.log(`player dt=${dt.toFixed(1)} x=${this.x.toFixed(1)} prevTop=${prevTop.toFixed(1)} newTop=${newTop.toFixed(1)} vy=${this.vy.toFixed(3)}`);
            }

            // 6) Colisiones con plataformas — IGNORAR plataformas que estén por debajo del área visible
            this.onGround = false;
            let standPlat = null;
            const tiles = (window.tileset && window.tileset.getAll) ? window.tileset.getAll() : [];
            const visibleBottom = (window.cameraY || 0) + (canvas.clientHeight || canvas.height);

            // tolerancia para evitar fallos por redondeo / dt grande
            const TOL = 2;

            for (let p of tiles) {
                // Ignorar plataformas demasiado por debajo de la vista (no queremos "agarrarse" a ellas)
                if (typeof p.y === 'number' && p.y > visibleBottom) continue;

                // Sin solapamiento horizontal
                if (this.x + this.width <= p.x || this.x >= p.x + p.width) continue;

                const platTop = p.y;
                const platBottom = p.y + p.height;

                // 6a) Choque pies (venimos desde arriba y caemos sobre la plataforma)
                // Si el borde inferior anterior estaba por encima (<=) y ahora está por debajo (>=)
                if (prevBottom <= platTop + TOL && newBottom >= platTop - TOL && this.vy >= 0) {
                    this.y = platTop - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    standPlat = p;
                    break;
                }

                // 6b) Choque cabeza (subimos y la cabeza ha cruzado la parte inferior de la plataforma)
                // Detectamos si el segmento vertical [newTop, prevTop] contiene platBottom (intersección por trazos)
                const segMin = Math.min(prevTop, newTop);
                const segMax = Math.max(prevTop, newTop);
                if (this.vy < 0 && (platBottom >= segMin - TOL) && (platBottom <= segMax + TOL)) {
                    // Colocamos al jugador justo debajo de la plataforma
                    this.y = platBottom;
                    this.vy = 0;
                    // no marcamos onGround
                    break;
                }
            }

            // 7) Plataforma móvil
            if (this.onGround && standPlat && standPlat.type === 'moving') {
                this.x += (standPlat.vx || 0) * dt;
                if (this.x > canvas.width) this.x = -this.width;
                else if (this.x + this.width < 0) this.x = canvas.width;
            }

            // 8) Soporte touch jump: si se ha pulsado el botón táctil, lanzar salto y consumir flag
            if (window.touchJump && this.onGround) {
                this.jump();
                window.touchJump = false;
            }
        }

        draw(ctx) {
            if (!ctx) return;
            const img = this.facing === 'left' ? this.imageLeft : this.imageRight;
            const loaded = this.facing === 'left' ? this.loadedLeft : this.loadedRight;
            if (loaded) ctx.drawImage(img, this.x, this.y, this.width, this.height);
            else {
                ctx.fillStyle = '#3a5f0b';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }

        jump() {
            if (!this.onGround) return;
            if (DEBUG) console.log('jump!');
            try { jumpSound.currentTime = 0; jumpSound.play().catch(() => { }); } catch (e) { }
            this.vy = -JUMP_VELOCITY;
            this.onGround = false;
        }
    }

    // Crear jugador si no existe
    if (!window.player) {
        new Player((canvas.width / 2) - 16, (canvas.height - 50 - 48));
    }

})(window);
