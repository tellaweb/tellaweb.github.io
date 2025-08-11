const BOARD_SIZE = 400; // px, ancho y alto fijos del tablero/pool
let gridSize = 4;       // por defecto 4×4

const piecesContainer = document.getElementById('pieces-container');
const puzzleBoard = document.getElementById('puzzle-board');
const difficultySel = document.getElementById('difficulty');
const resetBtn = document.getElementById('reset-button');

// Reconstruye todo el puzzle para un gridSize dado
function buildPuzzle(size) {
    gridSize = size;
    // Calculamos el ancho/alto de cada casilla en px
    const cellSize = BOARD_SIZE / size;

    // Ajustamos estilos de los contenedores
    [piecesContainer, puzzleBoard].forEach(el => {
        el.style.width = `${BOARD_SIZE}px`;
        el.style.height = `${BOARD_SIZE}px`;
        el.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
        el.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;
    });

    // Limpiamos viejo contenido
    piecesContainer.innerHTML = '';
    puzzleBoard.innerHTML = '';

    // Creamos piezas y drop zones
    for (let index = 0; index < size * size; index++) {
        const r = Math.floor(index / size), c = index % size;
        const posX = -c * cellSize, posY = -r * cellSize;

        // Pieza
        const piece = document.createElement('div');
        piece.classList.add('puzzle-piece');
        piece.draggable = true;
        piece.dataset.index = index;
        Object.assign(piece.style, {
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            backgroundSize: `${BOARD_SIZE}px ${BOARD_SIZE}px`,
            backgroundPosition: `${posX}px ${posY}px`
        });
        addDragEvents(piece);
        piecesContainer.appendChild(piece);

        // Zona de drop
        const zone = document.createElement('div');
        zone.classList.add('drop-zone');
        zone.dataset.correctIndex = index;
        zone.addEventListener('dragover', e => {
            e.preventDefault();
        });
        zone.addEventListener('drop', handleDrop);
        puzzleBoard.appendChild(zone);
    }

    shufflePieces();
}

// Estado de la pieza arrastrada
let draggedPiece = null;
function addDragEvents(piece) {
    piece.addEventListener('dragstart', e => {
        draggedPiece = piece;
        e.dataTransfer.effectAllowed = 'move';
    });
}

// Drop handler
function handleDrop(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    if (zone.children.length) return;  // ya ocupada

    const pieceIdx = draggedPiece.dataset.index;
    const correctIdx = zone.dataset.correctIndex;

    if (pieceIdx === correctIdx) {
        zone.appendChild(draggedPiece);
        zone.classList.add('correct');
        draggedPiece.draggable = false;
        checkPuzzleComplete();
    } else {
        zone.classList.add('incorrect');
        setTimeout(() => {
            zone.classList.remove('incorrect');
            piecesContainer.appendChild(draggedPiece);
        }, 700);
    }
    draggedPiece = null;
}

// Comprueba fin y lanza confetti
function checkPuzzleComplete() {
    const complete = [...puzzleBoard.children]
        .every(z => z.classList.contains('correct'));
    if (complete) {
        confetti({ particleCount: 150, spread: 60, origin: { y: 0.6 } });
    }
}

// Fisher–Yates shuffle
function shufflePieces() {
    const arr = Array.from(piecesContainer.children);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    piecesContainer.innerHTML = '';
    arr.forEach(p => piecesContainer.appendChild(p));
}

// Eventos UI
difficultySel.addEventListener('change', () => buildPuzzle(+difficultySel.value));
resetBtn.addEventListener('click', () => buildPuzzle(gridSize));

// Init
window.addEventListener('load', () => buildPuzzle(gridSize));