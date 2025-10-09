// js/questions.js
(function (window) {

    const questions = [
        {
            text: '¿Cuál es la capital de Australia?',
            choices: ['Sídney', 'Canberra', 'Melbourne'],
            answer: 1
        },
        {
            text: '¿En qué año llegó el hombre a la Luna?',
            choices: ['1965', '1969', '1972'],
            answer: 1
        }
        // …añade más…
    ];

    let activeQ = false;
    let currentQ = 0;
    let doorPlat = null;   // plataforma de ancho completo
    const doors = [];     // array de puertas activas

    class Door {
        constructor(x, y, label, isCorrect) {
            this.x = x;
            this.y = y;
            this.width = 40;
            this.height = 80;
            this.label = label;
            this.isCorrect = isCorrect;
        }
        draw(ctx, cameraY) {
            // puerta
            const sx = this.x;
            const sy = this.y - cameraY;
            ctx.fillStyle = this.isCorrect ? '#4caf50' : '#ff5722';
            ctx.fillRect(sx, sy, this.width, this.height);

            // texto
            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.label, sx + this.width / 2, sy + this.height / 2 + 6);
        }
        collides(ptX, ptY) {
            return ptX >= this.x &&
                ptX <= this.x + this.width &&
                ptY >= this.y &&
                ptY <= this.y + this.height;
        }
    }

    function activate(index) {
        currentQ = index;
        activeQ = true;
        doors.length = 0;

        const q = questions[index];
        const cw = window.canvas.width;
        const ch = window.canvas.height;
        const cam = window.cameraY;

        // 1) Plataforma completa al pie de la pantalla
        const platY = cam + ch - 30;
        doorPlat = { x: 0, y: platY, width: cw, height: 10 };

        // 2) Tres puertas sobre esa plataforma
        const doorY = platY - 80;
        const xs = [0.25, 0.5, 0.75].map(p => p * cw - 20);
        for (let i = 0; i < 3; i++) {
            doors.push(new Door(xs[i], doorY, q.choices[i], i === q.answer));
        }
    }

    function draw(ctx) {
        if (!activeQ) return;

        // overlay semitransparente
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);

        // texto de la pregunta
        ctx.fillStyle = '#fff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            questions[currentQ].text,
            window.canvas.width / 2,
            50
        );
        ctx.restore();

        // dibuja la plataforma ancha (world→screen)
        ctx.save();
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(
            doorPlat.x,
            doorPlat.y - window.cameraY,
            doorPlat.width,
            doorPlat.height
        );
        ctx.restore();

        // dibuja cada puerta
        doors.forEach(d => d.draw(ctx, window.cameraY));
    }

    function answer(door) {
        activeQ = false;
        doors.length = 0;
        doorPlat = null;

        if (door.isCorrect) {
            console.log('✅ ¡Correcto!');
        } else {
            console.log('❌ Fallaste');
            window.player.vy = 1.2;  // empuja jugador hacia abajo
        }
    }

    function onClick(e) {
        if (!activeQ) return;
        // Coordenadas de clic en canvas
        const rect = window.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top + window.cameraY;
        // comprueba en qué puerta clicaste
        const door = doors.find(d => d.collides(x, y));
        if (door) answer(door);
    }
    window.canvas.addEventListener('click', onClick);

    window.questionManager = {
        activate,
        draw,
        checkCollision: () => null, // ya no usamos colisiones físicas
        isActive: () => activeQ,
        getCount: () => questions.length
    };

})(window);
  
  
  
  