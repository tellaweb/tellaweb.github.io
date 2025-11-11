window.addEventListener("load", () => {
    const imagen = document.querySelector(".imagen-transicion img");
    if (imagen) {
        imagen.style.opacity = "1";
        imagen.style.transform = "translateY(0)";
    }
});


window.addEventListener("load", () => {
    const imagen = document.querySelector(".imagen-transicion img");
    if (imagen) {
        imagen.style.opacity = "1";
        imagen.style.transform = "translateY(0)";
    }
});

window.addEventListener("load", () => {
    const bloques = document.querySelectorAll(".bloque");
    bloques.forEach((bloque, i) => {
        setTimeout(() => {
            bloque.style.opacity = "1";
            bloque.style.transform = "translateY(0)";
        }, i * 150); // animación escalonada
    });
});


window.addEventListener("load", () => {
    const personas = document.querySelectorAll(".persona");
    personas.forEach((persona, i) => {
        setTimeout(() => {
            persona.style.opacity = "1";
            persona.style.transform = "translateY(0)";
        }, i * 150);
    });
});

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