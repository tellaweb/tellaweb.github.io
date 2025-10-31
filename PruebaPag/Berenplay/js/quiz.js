// js/quiz.js
window.quiz = (function () {
  const overlay = document.getElementById('quizOverlay');

  // 1) Precarga del audio de Game Over
  const gameOverSound = new Audio('assets/sounds/gameover.mp3');
  gameOverSound.volume = 0.7;

  // 1) Banco completo de preguntas
  const questions = [
    {
      text: '¿Qué tipo de cultivo es la acelga?',
      options: ['Hoja', 'Fruto', 'Raíz'],
      answer: 0
    },
    {
      text: '¿En qué mes no se planta la acelga?',
      options: ['Febrero', 'Diciembre', 'Enero'],
      answer: 1
    },
    {
      text: 'Instrumento para recoger hierba, paja, etc.',
      options: ['Rastrillo', 'Hoz', 'Horca'],
      answer: 0
    },
    {
      text: 'Instrumento para segar a ras de tierra.',
      options: ['Azada', 'Hoz', 'Guadaña'],
      answer: 2
    },
    {
      text: 'Instrumento que sirve para segar mieses y hierbas.',
      options: ['Azada', 'Hoz', 'Guadaña'],
      answer: 1
    },
    {
      text: '¿Qué tipo de cultivo es el ajo?',
      options: ['Hoja', 'Fruto', 'Raíz'],
      answer: 2
    },
    {
      text: '¿En qué mes no se planta el ajo?',
      options: ['Febrero', 'Diciembre', 'Enero'],
      answer: 0
    },
    // …añade aquí todas tus preguntas
  ];

  // 2) Array de preguntas pendientes (se vacía antes de recargar)
  let remainingQuestions = questions.slice();

  // 3) Puntos por cada acierto
  const CORRECT_BONUS = 5;

  // ¿Está activo el overlay (quiz o game-over)?
  function isActive() {
    return overlay.style.display === 'flex';
  }

  // Lanza una pregunta nueva
  function launch() {
    // Si ya no quedan preguntas pendientes, recargamos el array
    if (remainingQuestions.length === 0) {
      remainingQuestions = questions.slice();
    }

    // Elegimos un índice aleatorio de remainingQuestions
    const idx = Math.floor(Math.random() * remainingQuestions.length);
    const q = remainingQuestions.splice(idx, 1)[0];

    // Montamos el HTML del quiz
    overlay.innerHTML = `
      <div class="quiz-box" style="text-align:center;">
        <p>${q.text}</p>
        ${q.options.map((opt, i) =>
      `<button class="option" data-correct="${i === q.answer}">
             ${opt}
           </button>`
    ).join('')}
      </div>
    `;
    overlay.style.display = 'flex';

    // Reseteamos cualquier input residual del jugador
    window.player.clearInput();

    // Asociamos el clic a cada opción
    overlay.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        const correct = btn.dataset.correct === 'true';
        const current = score.get();
        const prevHigh = parseInt(localStorage.getItem('highScore') || '0', 10);
        const newHigh = Math.max(current, prevHigh);

        if (correct) {
          // Acierto: sumamos puntos y cerramos el quiz
          score.add(CORRECT_BONUS);
          overlay.style.display = 'none';
        } else {
          // FALLO → aquí ponemos el código para parar la BSO
          bgMusic.pause();
          bgMusic.currentTime = 0;
          // Fallo: actualizamos récord si procede y mostramos Game Over
          if (newHigh > prevHigh) {
            localStorage.setItem('highScore', newHigh);
          }
          showGameOver(current, newHigh);
        }
      });
    });
  }

  // Muestra la pantalla de Game Over
  function showGameOver(scoreValue, recordValue) {
    
    // 2) Reproducimos el sonido
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(() => {/* ignora errores de autoplay */ });
    overlay.innerHTML = `
      <div class="game-over-box" style="text-align:center;">
        <h1>Game Over</h1>
        <p>Tu puntuación: <strong>${scoreValue}</strong></p>
        <p>Récord:       <strong>${recordValue}</strong></p>
        <button id="retry">Volver a intentar</button>
      </div>
    `;
    overlay.style.display = 'flex';

    document.getElementById('retry').addEventListener('click', () => {
      // Al reiniciar partida recargamos el banco de preguntas
      remainingQuestions = questions.slice();
      location.reload();
    });
  }

  return {
    isActive,
    launch,
    showGameOver
  };
})();


