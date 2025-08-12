// js/game.js
(function () {
    // 0) Precarga y configuración de la música de fondo
    const bgMusic = new Audio('assets/sounds/bgm.mp3');
    bgMusic.loop = true;   // repetir al acabar
    bgMusic.volume = 0.5;    // 50% de volumen (0.0–1.0)
    // 1) Esperamos a que el usuario interactúe para poder llamar a play()
    function unlockAudio() {
        console.log('Usuario interactuó: desbloqueando bgMusic');
        bgMusic.play()
            .then(() => console.log('✅ bgMusic suena'))
            .catch(err => console.error('❌ bgMusic.play() error tras interacción:', err));
        // window.removeEventListener('pointerdown', unlockAudio);
        // window.removeEventListener('keydown', unlockAudio);
        // window.removeEventListener('touchstart', unlockAudio);
    }
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
      

   function isTouchDevice() {
    return 'ontouchstart' in window
        || navigator.maxTouchPoints > 0
        || /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  function initTouchControls() {
    const container = document.createElement('div');
    container.id = 'touch-controls';
    container.innerHTML = `
      <button id="btn-left"  class="btn control">←</button>
      <button id="btn-right" class="btn control">→</button>
      <button id="btn-jump"  class="btn control">⤒</button>
    `;
    document.body.appendChild(container);

    window.touchLeft  = false;
    window.touchRight = false;
    window.touchJump  = false;

    const bind = (id, flag) => {
      const btn = document.getElementById(id);
      btn.addEventListener('touchstart', () => window[flag] = true,  { passive: true });
      btn.addEventListener('touchend',   () => window[flag] = false, { passive: true });
    };
    bind('btn-left',  'touchLeft');
    bind('btn-right', 'touchRight');
    bind('btn-jump',  'touchJump');
    }
    

  if (isTouchDevice()) {
    initTouchControls();
  }

  // Inyecta el CSS mínimo; luego lo extraes a style.css
  const style = document.createElement('style');
  style.textContent = `
    #touch-controls {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  padding: 0 20px;        /* margen lateral */
  gap: 10px;
  z-index: 9999;
  
}

#touch-controls .btn.control {
  width: 200px;
  height: 200px;
  font-size: 96px;
  background: rgba(255,255,255,0.8);
  background-color: gray;
  color: white;
  border: none;
  border-radius: 8px;
  touch-action: none;
}

/* Empuja el botón de salto al extremo derecho */
#btn-jump {
  margin-left: auto;
}

  `;
  document.head.appendChild(style);

  // … resto del gameLoop, update(), render(), etc. …

 // <-- asegúrate de tener este cierre

    let lastTime = performance.now();
    let gameEnded = false;

    const ICON_SIZE = 32;   // debe coincidir con js/icons.js
    const MAX_AIR_SPAWN_HEIGHT = 150;  // altura máxima de salto en px
    const ICON_INTERVAL = 200;  // px ascendidos para generar icono
    const QUIZ_INTERVAL = 1500;  // px ascendidos para lanzar pregunta
    let nextIconSpawn = ICON_INTERVAL;
    let nextQuizSpawn = QUIZ_INTERVAL;

    window.cameraY = 0;

    // Pre­carga del fondo
    const bgImage = new Image();
    bgImage.src = 'assets/images/background.png';
    let bgReady = false;
    bgImage.onload = () => bgReady = true;

    // 1) Inicializa plataformas, iconos y puntuación
    tileset.initPlatforms(window.canvas);
    icons.reset();
    score.reset();

    // 2) Coloca al jugador sobre la primera plataforma
    const firstPlat = tileset.getAll()[0];
    if (firstPlat) {
        window.player.x = firstPlat.x + (firstPlat.width - window.player.width) / 2;
        window.player.y = firstPlat.y - window.player.height;
    }

    // 3) Genera el primer icono en sitio accesible
    spawnIconAccessible();

    // Pre­carga del sonido de recogida
    const pickupSound = new Audio('assets/sounds/pickup.mp3');
    pickupSound.volume = 0.6;

    // Pre­carga del sonido de game over
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
        if (window.quiz.isActive()) return;

        // 1) Mueve al jugador
        window.player.update(dt);

        // 2) Detecta colisiones jugador–icono
        const p = window.player;
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
                // Aquí reproducimos el sonido de recogida
                pickupSound.currentTime = 0;
                pickupSound.play().catch(() => {/* ignora errores de autoplay */ });
            }
        }

        // 3) Cámara solo hacia arriba
        window.cameraY = Math.min(window.cameraY, p.y - 200);

        // 4) Game Over al caer fuera de vista
        if (p.y > window.cameraY + window.canvas.height) {
            endGame();
            return;
        }

        // 5) Actualiza plataformas e iconos
        tileset.updatePlatforms(window.cameraY, dt, window.canvas);
        icons.updateAll();

        // 6) Genera iconos accesibles según el scroll
        const scrollDist = -window.cameraY;
        while (scrollDist > nextIconSpawn) {
            nextIconSpawn += ICON_INTERVAL;
            spawnIconAccessible();
        }

        // 7) Dispara quiz periódicamente
        if (scrollDist > nextQuizSpawn && p.onGround) {
            window.quiz.launch();
            nextQuizSpawn += QUIZ_INTERVAL;
        }
    }

    function render() {
        const ctx = window.ctx;
        const canvas = window.canvas;

        // 1) Limpia el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2) Dibuja el fondo
        if (bgReady) {
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#87ceeb';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 3) Dibuja el juego con la cámara
        ctx.save();
        ctx.translate(0, -window.cameraY);
        tileset.draw(ctx, canvas);
        window.player.draw(ctx);
        icons.drawAll(ctx);
        ctx.restore();
    }

    function endGame() {
        // aquí ya tienes acceso a bgMusic
        bgMusic.pause();
        bgMusic.currentTime = 0;

        gameEnded = true;
        // …resto de lógica y showGameOver()…
        // Reproducimos el sonido de derrota
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(() => { });
        //  Detenemos la banda sonora
        bgMusic.pause();
        bgMusic.currentTime = 0;
        gameEnded = true;
        const current = score.get();
        const prevHigh = parseInt(localStorage.getItem('highScore') || '0', 10);
        const newHigh = Math.max(current, prevHigh);
        if (newHigh > prevHigh) {
            localStorage.setItem('highScore', newHigh);
        }
        window.quiz.showGameOver(current, newHigh);
    }

    // Genera un icono sobre o en el aire (siempre alcanzable)
    function spawnIconAccessible() {
        const plats = window.tileset.getAll().filter(p =>
            p.y >= window.cameraY &&
            p.y <= window.cameraY + window.canvas.height
        );
        if (plats.length === 0) return;

        const plat = plats[Math.floor(Math.random() * plats.length)];
        const x = plat.x + Math.random() * (plat.width - ICON_SIZE);

        let y;
        if (Math.random() < 0.5) {
            y = plat.y - ICON_SIZE;
        } else {
            const extra = 20 + Math.random() * (MAX_AIR_SPAWN_HEIGHT - 20);
            y = plat.y - ICON_SIZE - extra;
        }

        window.icons.spawn(x, y);
    }

    // Asegúrate de que tu botón tiene id="btn-jump" en el HTML o en tu initTouchControls()
    //   <button id="btn-jump">⤒</button>

    const btnJump = document.getElementById('btn-jump');
    btnJump.addEventListener('pointerdown', e => {
        e.preventDefault();           // evita clicks fantasmas
        window.player.jump();         // dispara el salto
    }, { passive: false });

})();
  
  
  
  
  





