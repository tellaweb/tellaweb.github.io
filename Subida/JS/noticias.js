// Capturo las tres clases
let despliega = document.getElementsByClassName('leerMas');
let contrae = document.getElementsByClassName('leerMenos');
let texto = document.getElementsByClassName('desplegado');

// Recorro con un bucle for
for (let i = 0; i < despliega.length; i++) {

    // Al hacer clic en "Leer más"
    despliega[i].addEventListener('click' , function () {
        texto[i].style.display = 'inline';
        this.style.display = 'none';
        contrae[i].style.display = 'inline';
    });

    // Al hacer clic en "Leer menos"
    contrae[i].addEventListener('click', function () {
        texto[i].style.display = 'none';
        this.style.display = 'none';
        despliega[i].style.display = 'inline';
    });
}
