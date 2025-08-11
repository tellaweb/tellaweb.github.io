const menu = document.getElementById('ocultarMenu');
const submenu = document.getElementById('ocultarSubMenu');

// Alternar visibilidad del menú principal
menuH.addEventListener('click', function () {
    
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
    }
});

// Alternar visibilidad del submenú
submenuH.addEventListener('click', function () {

    if (submenu.style.display === 'block') {
        submenu.style.display = 'none';
    } else {
        submenu.style.display = 'block';
    }
});