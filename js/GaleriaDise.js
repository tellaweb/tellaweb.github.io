/* Script del footer */


    document.addEventListener("DOMContentLoaded", () => {
        const footer = document.querySelector(".footer-final");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    footer.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        if (footer) observer.observe(footer);
    });


/* Fin de Script del Footer */

/* Script de Botones */

    function toggleText(button) {
        const text = button.nextElementSibling;
        if (text.style.display === "block") {
            text.style.display = "none";
            button.textContent = "Ver más";
        } else {
            text.style.display = "block";
            button.textContent = "Ver menos";
        }
    }

/* Final de Script de Botones */

/* Menu Hamburguesa desplegable */

            // ====== Menú móvil / hamburguesa ======
                const btnHamb = document.querySelector('.hamburger');
                const menu = document.getElementById('menu');
                btnHamb?.addEventListener('click', () => menu.classList.toggle('open'));

/* Final del menu Hamburguesa desplegable */

