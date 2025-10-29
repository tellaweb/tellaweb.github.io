// puzzle.js - versión con soporte táctil y responsive

let gridSize = 4; // por defecto 4x4

const piecesContainer = document.getElementById('pieces-container');
const puzzleBoard = document.getElementById('puzzle-board');
const difficultySel = document.getElementById('difficulty');
const resetBtn = document.getElementById('reset-button');

let draggedPiece = null;
let selectedPiece = null; // para modo tap-to-place

function getBoardSizePx() {
    // usar el tamaño menor entre ancho/alto del contenedor para mantener cuadrado
    const rect = piecesContainer.getBoundingClientRect();
    return Math.min(rect.width, rect.height);
}

function buildPuzzle(size) {
    gridSize = size;
    const BOARD_SIZE = getBoardSizePx();
    const cellSize = BOARD_SIZE / size;

    [piecesContainer, puzzleBoard].forEach(el => {
        el.style.width = `${BOARD_SIZE}px`;
        el.style.height = `${BOARD_SIZE}px`;
        el.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
        el.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;
    });

    piecesContainer.innerHTML = '';
    puzzleBoard.innerHTML = '';

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
        addDragAndTouchEvents(piece);
        piecesContainer.appendChild(piece);

        // Zona de drop
        const zone = document.createElement('div');
        zone.classList.add('drop-zone');
        zone.dataset.correctIndex = index;
        zone.addEventListener('dragover', e => e.preventDefault());
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('pointerdown', zonePointerDown); // para tap-to-place
        puzzleBoard.appendChild(zone);
    }

    shufflePieces();
}

// Manejo drag (escritorio) y pointer/touch (móvil)
function addDragAndTouchEvents(piece) {
    // Drag & drop nativo
    piece.addEventListener('dragstart', e => {
        draggedPiece = piece;
        e.dataTransfer.effectAllowed = 'move';
    });

    // Pointer events para móviles y táctiles
    piece.addEventListener('pointerdown', e => {
        // Solo manejamos toques primarios
        if (e.button && e.button !== 0) return;
        piece.setPointerCapture(e.pointerId);
        // Selección por toque: alternar selección
        if (isTouchEvent(e)) {
            if (selectedPiece === piece) {
                // deseleccionar si ya seleccionado
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
            } else {
                if (selectedPiece) selectedPiece.classList.remove('selected');
                selectedPiece = piece;
                selectedPiece.classList.add('selected');
            }
        } else {
            // en dispositivos no táctiles, actuamos como inicio de drag
            draggedPiece = piece;
        }
    });

    piece.addEventListener('pointerup', e => {
        try { piece.releasePointerCapture(e.pointerId); } catch { }
    });

    // Evitar que el gesto táctil haga scroll al arrastrar la pieza
    piece.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
}

function isTouchEvent(e) {
    return (e.pointerType && e.pointerType === 'touch') || (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent);
}

function zonePointerDown(e) {
    // Si hay una pieza seleccionada (tap-to-place), intentar colocarla
    if (selectedPiece) {
        const zone = e.currentTarget;
        if (zone.children.length) {
            // zona ocupada -> ignorar
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
            return;
        }
        const pieceIdx = selectedPiece.dataset.index;
        const correctIdx = zone.dataset.correctIndex;
        if (pieceIdx === correctIdx) {
            zone.appendChild(selectedPiece);
            zone.classList.add('correct');
            selectedPiece.draggable = false;
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
            checkPuzzleComplete();
        } else {
            zone.classList.add('incorrect');
            setTimeout(() => zone.classList.remove('incorrect'), 700);
            // devolver la pieza al pool si aún está fuera
            piecesContainer.appendChild(selectedPiece);
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
        }
    }
}

// Drop handler (drag & drop normal)
function handleDrop(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    if (zone.children.length) return;

    if (!draggedPiece) return;
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
    const complete = [...puzzleBoard.children].every(z => z.classList.contains('correct'));
    if (complete) confetti({ particleCount: 150, spread: 60, origin: { y: 0.6 } });
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

window.addEventListener('load', () => buildPuzzle(gridSize));
// Reconstruir al rotar o cambiar tamaño de pantalla
window.addEventListener('resize', () => buildPuzzle(gridSize));
