document.getElementById('abrirA').addEventListener('click', function () {
    // Suponiendo que i y j están definidos previamente
    if (window.innerWidth < 750) {
        // Alternar visibilidad de i
        if (i.style.display === 'block') {
            i.style.display = 'none';
        } else {
            i.style.display = 'block';
            j.style.display = 'none';
            c.style.display = 'none';
        }
    } else {
        // Alternar visibilidad de j
        if (j.style.display === 'block') {
            j.style.display = 'none';
        } else {
            j.style.display = 'block';
            i.style.display = 'none';
            c.style.display = 'none';
        }
    }
});
document.getElementById('abrirC').addEventListener('click', function () {
        // Alternar visibilidad de c
        if (c.style.display === 'block') {
            c.style.display = 'none';      
        } else {
            c.style.display = 'block';
            j.style.display = 'none';
            i.style.display = 'none';
        }
});

document.getElementById('cosecha').addEventListener('click', function verEnPantallaCompleta() {
    if (this.requestFullscreen) {
        this.requestFullscreen();
    }
    else this.close();
});
