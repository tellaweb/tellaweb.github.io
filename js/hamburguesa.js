function menu() {
    const container = document.querySelector('.ocultarMenu');
    // Se revisa el estado actual y se alterna entre 'block' y 'none'
    container.style.display = (container.style.display === 'block' ? 'none' : 'block');
}