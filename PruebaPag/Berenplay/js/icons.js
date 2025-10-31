// js/icons.js
(function (window) {
    const ICON_SIZE = 32;
    let iconsList = [];

    // Pre-carga de tu imagen de icono
    const iconImg = new Image();
    iconImg.src = 'assets/images/puntos.png';

    function spawn(x, y) {
        iconsList.push({ x, y });
    }

    function reset() {
        iconsList = [];
    }

    function updateAll() {
        // si tus iconos se mueven o animan, ponlo aquí
    }

    // Devuelve el array para iterar colisiones
    function getAll() {
        return iconsList;
    }

    // Elimina el icono en el índice dado
    function remove(index) {
        iconsList.splice(index, 1);
    }

    function drawAll(ctx) {
        iconsList.forEach(ic => {
            if (iconImg.complete) {
                ctx.drawImage(iconImg, ic.x, ic.y, ICON_SIZE, ICON_SIZE);
            } else {
                // fallback mientras carga la imagen
                ctx.fillStyle = 'gold';
                ctx.fillRect(ic.x, ic.y, ICON_SIZE, ICON_SIZE);
            }
        });
    }

    window.icons = { spawn, reset, updateAll, drawAll, getAll, remove };
})(window);
  