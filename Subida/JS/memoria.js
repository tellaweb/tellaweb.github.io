// Lista de imágenes (siempre pares)
const images = [
    "../IMG/FrutasJuegos/Frambuesa.PNG",
    "../IMG/FrutasJuegos/Kiwi.PNG",
    "../IMG/FrutasJuegos/Fresa.PNG",
    "../IMG/FrutasJuegos/Higo.PNG",
    "../IMG/FrutasJuegos/Mora.PNG",
    "../IMG/FrutasJuegos/Arandano.PNG",
    "../IMG/FrutasJuegos/Limon.PNG",
    "../IMG/FrutasJuegos/Pera.PNG",
    "../IMG/FrutasJuegos/Ciruela.PNG",
    "../IMG/FrutasJuegos/UvaBlanca.PNG",
    "../IMG/FrutasJuegos/ManzanaVerde.PNG",
    "../IMG/FrutasJuegos/Naranja.PNG",
    "../IMG/FrutasJuegos/Uvas.PNG"
];

// Referencias al DOM
const board = document.getElementById("game-board");
const winOverlay = document.getElementById("winning-overlay");
const restartWin = document.getElementById("restart-win");
const restartAll = document.getElementById("restart-all");
const diffSelect = document.getElementById("difficulty-select");

const parejasPorNivel = {
    facil: 4,
    media: 5,
    dificil: 6,
    extremo: 10
};

let currentPairs = parejasPorNivel[diffSelect.value];
let firstCard, secondCard, lockBoard;

// Mezcla un array aleatoriamente
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Crea una carta en el DOM
function createCard(src) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.name = src;
    card.innerHTML = `
    <div class="card-inner">
      <div class="card-front"></div>
      <div class="card-back">
        <img src="${src}" alt="Carta">
      </div>
    </div>`;
    card.addEventListener("click", flipCard);
    board.appendChild(card);
}

// Inicializa o reinicia el tablero con currentPairs
function initBoard() {
    winOverlay.classList.remove("show");
    [firstCard, secondCard, lockBoard] = [null, null, false];
    board.innerHTML = "";

    const seleccion = shuffle(images.slice()).slice(0, currentPairs);
    const deck = shuffle([...seleccion, ...seleccion]);

    // Ajusta columnas según dificultad
    if (currentPairs === 4) board.style.gridTemplateColumns = "repeat(4,1fr)";
    else if (currentPairs === 5) board.style.gridTemplateColumns = "repeat(5,1fr)";
    else if (currentPairs === 6) board.style.gridTemplateColumns = "repeat(4,1fr)";
    else if (currentPairs === 10) board.style.gridTemplateColumns = "repeat(5,1fr)";

    deck.forEach(createCard);
}

// Gestiona el giro de la carta
function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add("flip");
    if (!firstCard) firstCard = this;
    else {
        secondCard = this;
        checkMatch();
    }
}

// Comprueba si coinciden las dos cartas
function checkMatch() {
    if (firstCard.dataset.name === secondCard.dataset.name) {
        disableCards();
    } else {
        unflipCards();
    }
}

// Desactiva eventos en parejas acertadas
function disableCards() {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    if (document.querySelectorAll(".card.flip").length === board.children.length) {
        endGame();
    }
    resetTurn();
}

// Vuelve a girar cartas fallidas
function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove("flip");
        secondCard.classList.remove("flip");
        resetTurn();
    }, 1000);
}

// Reinicia variables de turno
function resetTurn() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

// Al ganar, dispara confetti y muestra overlay
function endGame() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    winOverlay.classList.add("show");
}

// Al cambiar la dificultad, actualiza y reinicia
diffSelect.addEventListener("change", () => {
    currentPairs = parejasPorNivel[diffSelect.value];
    initBoard();
});

// Botón “Reiniciar” permanente
restartAll.addEventListener("click", () => {
    initBoard();
});

// Botón “Reiniciar” en overlay de victoria (protegido)
if (restartWin) {
    restartWin.addEventListener("click", () => {
        winOverlay.classList.remove("show");
        initBoard();
    });
}

// Arranca la primera partida
initBoard();
