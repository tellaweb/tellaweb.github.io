document.getElementById('abrir').addEventListener('click', function () {
    // Suponiendo que i y j están definidos previamente
    if (window.innerWidth < 750) {
        // Alternar visibilidad de i
        if (i.style.display === 'block') {
            i.style.display = 'none';
        } else {
            i.style.display = 'block';
            j.style.display = 'none';
        }
    } else {
        // Alternar visibilidad de j
        if (j.style.display === 'block') {
            j.style.display = 'none';
        } else {
            j.style.display = 'block';
            i.style.display = 'none';
        }
    }
});
