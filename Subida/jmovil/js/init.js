// js/init.js

// Inicialización del canvas y contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Exponemos al global
window.canvas = canvas;
window.ctx = ctx;

// Inicializamos cámara global (player.js y game.js la usarán)
window.cameraY = 0;
