// js/score.js
(function (window) {
    let points = 0;

    function add(n) {
        points += n;
        updateHUD();
    }

    function reset() {
        points = 0;
        updateHUD();
    }

    function get() {
        return points;
    }

    function updateHUD() {
        const el = document.getElementById('scoreHUD');
        if (el) el.textContent = `Puntos: ${points}`;
    }

    window.score = { add, reset, get };

})(window);
  
  