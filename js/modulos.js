// ====== Menú móvil / hamburguesa ======
const btnHamb = document.querySelector('.hamburger');
const menu = document.getElementById('menu');
btnHamb?.addEventListener('click', () => menu.classList.toggle('open'));

// ====== Scroll suave para anclas ======
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
            e.preventDefault();
            document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
            menu?.classList.remove('open');
        }
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