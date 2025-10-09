// js/game.js
(function () {
    'use strict';

    // 0) Precarga y configuración de la música de fondo
    const bgMusic = new Audio('assets/sounds/bgm.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.5;

    // 1) Esperamos a que el usuario interactúe para poder llamar a play()
    function unlockAudio() {
        console.log('Usuario interactuó: desbloqueando bgMusic');
        bgMusic.play()
            .then(() => console.log('✅ bgMusic suena'))
            .catch(err => console.error('❌ bgMusic.play() error tras interacción:', err));
    }
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });

    // Helpers touch
    function isTouchDevice() {
        return 'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
    }

    function initTouchControls() {
        if (document.getElementById('touch-controls')) return;
        const container = document.createElement('div');
        container.id = 'touch-controls';
        container.innerHTML = `
      <button id="btn-left"  class="btn control" aria-label="izquierda">←</button>
      <button id="btn-right" class="btn control" aria-label="derecha">→</button>
      <button id="btn-jump"  class="btn control" aria-label="saltar">⤒</button>
    `;
        document.body.appendChild(container);

        window.touchLeft = false;
        window.touchRight = false;
        window.touchJump = false;

        const safeBind = (id, flag) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('touchstart', () => window[flag] = true, { passive: true });
            btn.addEventListener('touchend', () => window[flag] = false, { passive: true });
            btn.addEventListener('pointerdown', () => window[flag] = true, { passive: true });
            btn.addEventListener('pointerup', () => window[flag] = false, { passive: true });
            btn.addEventListener('pointercancel', () => window[flag] = false, { passive: true });
        };
        safeBind('btn-left', 'touchLeft');
        safeBind('btn-right', 'touchRight');
        safeBind('btn-jump', 'touchJump');
    }

    if (isTouchDevice()) initTouchControls();

    // Inyecta estilos mínimos (puedes mover a CSS)
    if (!document.getElementById('game-touch-style')) {
        const style = document.createElement('style');
        style.id = 'game-touch-style';
        style.textContent = `
#touch-controls {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  padding: 0 20px;
  gap: 10px;
  z-index: 9999;
}
#touch-controls .btn.control {
  width: 22vw;
  height: 22vw;
  max-width: 160px;
  max-height: 160px;
  font-size: 5.5vw;
  min-width: 56px;
  min-height: 56px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  border-radius: 8px;
  touch-action: none;
}
#btn-jump { margin-left: auto; }
    `;
        document.head.appendChild(style);
    }

    // ------------------------------------------------------------
    // Validaciones iniciales y namespace
    // ------------------------------------------------------------
    if (!window.canvas || !window.ctx) {
        console.error('game.js: window.canvas o window.ctx no encontrados. Asegúrate de que init.js se cargó antes.');
        return;
    }
    window.Game = window.Game || {};
    window.Game.bgMusic = bgMusic;

    let lastTime = performance.now();
    let gameEnded = false;

    const ICON_SIZE = (window.icons && window.icons.ICON_SIZE) ? window.icons.ICON_SIZE : 32;
    const MAX_AIR_SPAWN_HEIGHT = 150;
    const ICON_INTERVAL = 200;
    let nextIconSpawn = ICON_INTERVAL;

    window.cameraY = window.cameraY || 0;

    // Fondo
    const bgImage = new Image();
    bgImage.src = 'assets/images/background.png';
    let bgReady = false;
    bgImage.onload = () => bgReady = true;

    // Comprueba dependencias clave
    if (!window.tileset || !window.icons || !window.player || !window.score) {
        console.error('game.js: faltan dependencias (tileset/icons/player/score).');
        return;
    }

    // Inicialización (ordenada)
    function initialSetup() {
        try { tileset.initPlatforms(window.canvas); } catch (e) { console.error('Error en tileset.initPlatforms:', e); }
        try { icons.reset(); } catch (e) { console.warn('icons.reset fallo', e); }
        try { score.reset(); } catch (e) { console.warn('score.reset fallo', e); }

        // Posicionar jugador sobre la primera plataforma (con margen)
        const firstPlat = (tileset.getAll && tileset.getAll()[0]) || null;
        if (firstPlat && window.player) {
            window.player.x = firstPlat.x + (firstPlat.width - window.player.width) / 2;
            window.player.y = firstPlat.y - window.player.height - 3; // 3px margen para evitar penetración
            if (typeof window.player.vx !== 'undefined') window.player.vx = 0;
            if (typeof window.player.vy !== 'undefined') window.player.vy = 0;
            window.player.onGround = true;
        }

        // Generar primer icono accesible
        try { spawnIconAccessible(); } catch (e) { }
    }

    initialSetup();

    const pickupSound = new Audio('assets/sounds/pickup.mp3');
    pickupSound.volume = 0.6;
    const gameOverSound = new Audio('assets/sounds/gameover.mp3');
    gameOverSound.volume = 1;

    requestAnimationFrame(gameLoop);

    function gameLoop(ts) {
        const dt = Math.min(ts - lastTime, 40);
        lastTime = ts;
        update(dt);
        render();
        if (!gameEnded) requestAnimationFrame(gameLoop);
    }

    function update(dt) {
        if (!window.player) return;

        // 1) Mueve al jugador
        try { window.player.update(dt); } catch (e) { console.error('player.update fallo', e); return; }

        const p = window.player;

        // 2) Detecta colisiones jugador–icono
        try {
            const iconsArr = window.icons.getAll();
            for (let i = iconsArr.length - 1; i >= 0; i--) {
                const ic = iconsArr[i];
                if (
                    p.x < ic.x + ICON_SIZE &&
                    p.x + p.width > ic.x &&
                    p.y < ic.y + ICON_SIZE &&
                    p.y + p.height > ic.y
                ) {
                    window.icons.remove(i);
                    score.add(1);
                    pickupSound.currentTime = 0;
                    pickupSound.play().catch(() => { });
                }
            }
        } catch (e) {
            console.error('Error al procesar iconos:', e);
        }

        // 3) Cámara: solo hacia arriba (mantenemos cámara en coordenadas de mundo)
        window.cameraY = Math.min(window.cameraY, p.y - 200);

        // 4) Game Over: comprobación robusta usando coordenada en pantalla
        const playerScreenY = p.y - window.cameraY;
        const canvasScreenH = (window.canvas && (window.canvas.clientHeight || window.canvas.height)) ? (window.canvas.clientHeight || window.canvas.height) : window.canvas.height;
        const FALL_THRESHOLD = canvasScreenH + 50;

        if (playerScreenY > FALL_THRESHOLD) {
            endGame();
            return;
        }

        // 5) Actualiza plataformas e iconos
        try { tileset.updatePlatforms(window.cameraY, dt); } catch (e) { console.error('tileset.updatePlatforms fallo', e); }
        try { icons.updateAll(); } catch (e) { /* noop */ }

        // 6) Genera iconos accesibles según el scroll
        const scrollDist = -window.cameraY;
        while (scrollDist > nextIconSpawn) {
            nextIconSpawn += ICON_INTERVAL;
            spawnIconAccessible();
        }

        // 7) Soporte: si touchJump fue pulsado, consumirlo (player lo gestionará)
        if (window.touchJump) {
            // player.update debe gestionar touchJump y resetearlo
        }
    }

    function render() {
        const ctx = window.ctx;
        const canvas = window.canvas;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bgReady) {
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#87ceeb';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.save();
        ctx.translate(0, -window.cameraY);
        try { tileset.draw(ctx); } catch (e) { /* noop */ }
        try { window.player.draw(ctx); } catch (e) { /* noop */ }
        try { icons.drawAll(ctx); } catch (e) { /* noop */ }
        ctx.restore();
    }

    function endGame() {
        if (gameEnded) return;
        gameEnded = true;

        // Parar bgMusic de forma segura
        try { bgMusic.pause(); bgMusic.currentTime = 0; } catch (e) { /* noop */ }

        // Sonido de game over
        try { gameOverSound.currentTime = 0; gameOverSound.play().catch(() => { }); } catch (e) { /* noop */ }

        // Guardar puntuación
        const current = (score && typeof score.get === 'function') ? score.get() : 0;
        const prevHigh = parseInt(localStorage.getItem('highScore') || '0', 10);
        const newHigh = Math.max(current, prevHigh);
        if (newHigh > prevHigh) {
            try { localStorage.setItem('highScore', newHigh); } catch (e) { /* ignore */ }
        }

        // Mostrar pantalla de Game Over si existe el contenedor
        const go = document.getElementById('gameOver');
        const finalScoreEl = document.getElementById('finalScore');
        if (finalScoreEl) finalScoreEl.textContent = `Puntos: ${current}`;
        if (go) {
            go.style.display = 'flex';
            // ocultar controles táctiles para evitar interacción tras game over
            const tc = document.getElementById('touch-controls');
            if (tc) tc.style.display = 'none';
        } else {
            // si no hay UI, recargar por defecto tras 1.5s
            setTimeout(() => location.reload(), 1500);
        }
    }

    // resetGame: reinicia el estado sin recargar la página
    function resetGame() {
        // Parar sonidos en curso
        try { bgMusic.pause(); bgMusic.currentTime = 0; } catch (e) { }
        try { gameOverSound.pause(); gameOverSound.currentTime = 0; } catch (e) { }

        // Resetar banderas y estados
        gameEnded = false;
        window.cameraY = 0;
        nextIconSpawn = ICON_INTERVAL;

        // Reset score, icons y tileset
        try { score.reset(); } catch (e) { console.warn('score.reset fallo', e); }
        try { icons.reset(); } catch (e) { console.warn('icons.reset fallo', e); }
        try { if (typeof tileset.reset === 'function') tileset.reset(); } catch (e) { console.warn('tileset.reset fallo', e); }

        // Re-inicializar plataformas y posicionar jugador de forma ordenada
        try { tileset.initPlatforms(window.canvas); } catch (e) { console.error('initPlatforms fallo', e); }
        const first = (tileset.getAll && tileset.getAll()[0]) || null;
        if (first && window.player) {
            window.player.x = first.x + (first.width - window.player.width) / 2;
            window.player.y = first.y - window.player.height - 3;
            if (typeof window.player.vx !== 'undefined') window.player.vx = 0;
            if (typeof window.player.vy !== 'undefined') window.player.vy = 0;
            window.player.onGround = true;
        }

        // Regenerar iconos tras plataformas
        try { spawnIconAccessible(); } catch (e) { }

        // Ocultar pantalla de game over y reactivar controles táctiles
        const go = document.getElementById('gameOver');
        if (go) go.style.display = 'none';
        const tc = document.getElementById('touch-controls');
        if (tc) tc.style.display = '';

        // Reiniciar lastTime y arrancar el loop
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);

        // Reproducir bgMusic si se desea
        try { bgMusic.currentTime = 0; bgMusic.play().catch(() => { }); } catch (e) { }
    }

    // Genera un icono sobre o en el aire (siempre alcanzable)
    function spawnIconAccessible() {
        try {
            const plats = window.tileset.getAll().filter(p =>
                p.y >= window.cameraY &&
                p.y <= window.cameraY + window.canvas.height
            );
            if (plats.length === 0) return;
            const plat = plats[Math.floor(Math.random() * plats.length)];
            const x = plat.x + Math.random() * Math.max(1, (plat.width - ICON_SIZE));
            let y;
            if (Math.random() < 0.5) {
                y = plat.y - ICON_SIZE;
            } else {
                const extra = 20 + Math.random() * Math.max(0, (MAX_AIR_SPAWN_HEIGHT - 20));
                y = plat.y - ICON_SIZE - extra;
            }
            window.icons.spawn(x, y);
        } catch (e) {
            console.error('spawnIconAccessible fallo', e);
        }
    }

    // Añadir listener seguro para btn-jump
    (function attachJump() {
        const btnJump = document.getElementById('btn-jump');
        if (!btnJump) return;
        btnJump.addEventListener('pointerdown', e => {
            e.preventDefault();
            try { window.player?.jump?.(); } catch (ex) { /* noop */ }
        }, { passive: false });
    })();

    // Conectar botón de reinicio: busca id="retry" o el button dentro de #gameOver
    (function attachRetry() {
        const retry = document.getElementById('retry') || (function () {
            const go = document.getElementById('gameOver');
            if (!go) return null;
            return go.querySelector('button');
        })();
        if (!retry) return;
        retry.addEventListener('click', function (e) {
            e.preventDefault();
            resetGame();
        });
    })();

    // Llamamos a spawnIconAccessible al inicio (después de su definición)
    try { spawnIconAccessible(); } catch (e) { /* noop */ }

})();
