// js/tileset.js
(function (window) {
    const platforms = [];
    let canvasW, canvasH;

    // 1) Carga del sprite
    const platformImg = new Image();
    platformImg.src = 'assets/images/platform.png';
    let imgReady = false;
    platformImg.onload = () => imgReady = true;

    // 2) Parámetros de generación
    const INITIAL_COUNT = 10;    // plataformas iniciales
    const GAP_Y = 120;   // distancia vertical fija
    const START_OFFSET = 50;    // píxeles sobre el suelo para la 1ª
    const OFFSCREEN_REMOVE = 200;   // píxeles bajo la vista antes de eliminar
    const MAX_HOR_JUMP = 150;   // separación horizontal máxima alcanzable

    let nextPlatformY;              // mundo-Y donde spawnear la siguiente

    // 3) Inicialización: genera INITIAL_COUNT plataformas hacia arriba
    function initPlatforms(canvas) {
        canvasW = canvas.width;
        canvasH = canvas.height;
        platforms.length = 0;

        // la primera sale START_OFFSET px por encima del fondo
        nextPlatformY = canvasH - START_OFFSET - 16;

        // generamos tirando de spawnOne
        let prevX = canvasW / 2 - 16;  // posición inicial horizontal “céntrica”
        for (let i = 0; i < INITIAL_COUNT; i++) {
            spawnOne(nextPlatformY, prevX);
            prevX = platforms[platforms.length - 1].x;
            nextPlatformY -= GAP_Y;
        }
    }

    // 4) Devuelve el array de plataformas
    function getAll() {
        return platforms;
    }

    // 5) Lógica por frame: elimina viejas, crea nuevas solo por arriba y mueve móviles
    function updatePlatforms(cameraY, dt) {
        // A) eliminamos las que caen bajo la vista
        for (let i = platforms.length - 1; i >= 0; i--) {
            if (platforms[i].y > cameraY + canvasH + OFFSCREEN_REMOVE) {
                platforms.splice(i, 1);
            }
        }

        // B) generamos mientras la cámara suba más allá de nextPlatformY
        while (nextPlatformY > cameraY) {
            const prevX = platforms[platforms.length - 1].x;
            spawnOne(nextPlatformY, prevX);
            nextPlatformY -= GAP_Y;
        }

        // C) mover plataformas “moving”
        platforms.forEach(p => {
            if (p.type === 'moving') {
                p.x += p.vx * dt;
                // rebotar en bordes
                if (p.x < 0) {
                    p.x = 0;
                    p.vx *= -1;
                }
                if (p.x + p.width > canvasW) {
                    p.x = canvasW - p.width;
                    p.vx *= -1;
                }
            }
        });
    }

    // 6) Dibuja cada plataforma con la imagen o rectángulo de fallback
    function draw(ctx) {
        platforms.forEach(p => {
            if (imgReady) {
                ctx.drawImage(
                    platformImg,
                    0, 0,
                    platformImg.width, platformImg.height,
                    p.x, p.y,
                    p.width, p.height
                );
            } else {
                ctx.fillStyle = '#654321';
                ctx.fillRect(p.x, p.y, p.width, p.height);
            }
        });
    }

    // Función interna para crear UNA plataforma en Y con ancho aleatorio,
    // tipo estático o móvil, y x restringido a MAX_HOR_JUMP desde prevX
    function spawnOne(y, prevX) {
        const w = 80 + Math.random() * 80; // ancho entre 80 y 160
        // limitamos X para que no quede inalcanzable
        const minX = Math.max(0, prevX - MAX_HOR_JUMP);
        const maxX = Math.min(canvasW - w, prevX + MAX_HOR_JUMP);
        const x = maxX > minX
            ? minX + Math.random() * (maxX - minX)
            : Math.random() * (canvasW - w);

        // 20% de posibilidades de ser móvil
        const type = Math.random() < 0.2 ? 'moving' : 'static';
        let vx = 0;
        if (type === 'moving') {
            vx = (0.02 + Math.random() * 0.08) * (Math.random() < 0.5 ? -1 : 1);
        }

        platforms.push({ x, y, width: w, height: 16, type, vx });
    }

    // Exponemos la API
    window.tileset = {
        initPlatforms,
        getAll,
        updatePlatforms,
        draw
    };
})(window);
  
