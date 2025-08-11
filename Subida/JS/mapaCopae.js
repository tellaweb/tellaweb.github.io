var map = L.map('mapa').setView([43.440125963911754, -5.852248501508425], 11);
L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.opentopomap.org/copyright"> OpenStreetMap </a> contributors',
    maxZoom: 19
}).addTo(map);

// marcadores para señalar ubicaciones específicas en el mapa:
var marker = L.marker([43.436991, -5.855055]).addTo(map);
marker.bindPopup("C.P. José de Calasanz<br> <a target='_blank' href='https://www.facebook.com/people/CP-San-Jos%C3%A9-de-Calasanz/100085496567667/'> <img src='../IMG/face.png' width='20%'> </a> <a target='_blank' href='https://x.com/i/flow/login?redirect_after_login=%2Fcp_sanjose'> <img src='../IMG/Twitter.png' width='20%'> </a> <a target='_blank' href='https://www.cpsanjosellanera.es/web/'><img src='../IMG/Colegios/CPCalasanz.jpg' width='100%'></a>").openPopup();
/*marker.on('click',function (e){
        map.setView([43.436991, -5.855055])}); para centrar el punto al hacer click*/

var marker = L.marker([43.438054, -5.847633]).addTo(map);
marker.bindPopup("I. E. S. Llanera<br> <a target='_blank' href='https://www.facebook.com/ies.llanera'> <img src='../IMG/face.png' width='25%'> </a> <a target='_blank' href='https://www.instagram.com/explore/locations/305447244/ies-llanera/'> <img src='../IMG/insta.png' width='25%'> </a> <a target='_blank' href='https://www.youtube.com/watch?v=M8wAGxx682M'> <img src='../IMG/youtube.png' width='25%'> </a> <a target='_blank' href='https://alojaweb.educastur.es/web/iesllanera'><img src='../IMG/Colegios/IES Llanera.jpg' width='100%'> </a>").openPopup();

var marker = L.marker([43.433643, -5.879523]).addTo(map);
marker.bindPopup("C. P. San Cucao<br> <a target='_blank' href='https://www.facebook.com/sancucao2/'> <img src='../IMG/face.png' width='25%'></a> <a target='_blank' href='https://x.com/sancucao2?lang=es'> <img src='../IMG/Twitter.png' width='25%'> </a> <a target='_blank' href='https://alojaweb.educastur.es/web/cpsancucao'><img src='../IMG/Colegios/colegioSanCucao.jpg' width='100%'><a/>").openPopup();

var marker = L.marker([43.437429, -5.801276]).addTo(map);
marker.bindPopup("Ecole International School<br> <a target='_blank' href='https://www.facebook.com/ies.llanera'> <img src='../IMG/face.png' width='25%'> </a> <a target='_blank' href='https://www.instagram.com/explore/locations/305447244/ies-llanera/'> <img src='../IMG/insta.png' width='25%'> </a> <a target='_blank' href='https://www.youtube.com/watch?v=M8wAGxx682M'> <img src='../IMG/youtube.png' width='25%'></a> <a target='_blank' href='https://www.facebook.com/ies.llanera'> <img src='../IMG/linkedin.png' width='25%'></a> <a target='_blank' href='https://x.com/sancucao2?lang=es'> <img src='../IMG/twitter.png' width='25%'></a> <a target='_blank' href='https://x.com/sancucao2?lang=es'> <img src='../IMG/pinterest.png' width='25%'></a> <a target='_blank' href='https://colegioecole.com/'><img src='../IMG/Colegios/Ecole.jpg' width='100%'></a>").openPopup();

var marker = L.marker([43.243552, -5.566208]).addTo(map);
marker.bindPopup("C.P. Elena Sanchez Tamargo<br><a target=_blank' href='https://alojaweb.educastur.es/web/cpelena/contacto1'><img src='../IMG/Colegios/CPEST.jpg'width='100%'></a>").openPopup();

var marker = L.marker([43.484916, -6.112831]).addTo(map);
marker.bindPopup("C.P. Santa Eulalia de Merida<br><a target='_blank' href='https://alojaweb.educastur.es/web/cppravia'><img src='../IMG/Colegios/CPStaEulaliaM.jpg' width='100%'></a>").openPopup();

var marker = L.marker([43.372713262293544, -5.840033425276145]).addTo(map);
marker.bindPopup("C.P. Germán Fernández Ramos<br> </a> <a target='_blank' href='https://www.youtube.com/c/CPGERMANFERNANDEZRAMOS'> <img src='../IMG/youtube.png' width='15%'></a> <img src='../IMG/Colegios/GermanFdezR.jpg' width='100%'>").openPopup();

// formas como circulos y poligonos:
var circle = L.circle([43.438040, -5.848885], {
    color: 'orange',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 100
}).addTo(map);

// circle.bindPopup("<b>Red de huertos ecológicos de Asturias</b><br>  <img width='100%' src='../IMG/cucumber-plant.jpg'>").openPopup();
/*
 var polygon = L.polygon([
   [51.509, -0.08],
   [51.503, -0.06],
   [51.51, -0.047]
 ]).addTo(map);
 */
// capas de control para que los usuarios puedan cambiar entre diferentes mapas de fondo o activar / desactivar capas de información adicionales:
var baseMaps = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map),
    "Satellite": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenTopoMap contributors' })
};

var overlayMaps = {
    "Markers": L.layerGroup([marker]).addTo(map),
    //"Circles": L.layerGroup([circle]),
    // "Polygons": L.layerGroup([polygon])
};
L.control.layers(baseMaps, overlayMaps).addTo(map);

map.on('click', function (e) {
    // alert("Has hecho clic en el mapa en " + e.latlng);

    var z = map.getZoom();
    if (z < 18)
        // subir el zoom
        map.zoomIn();
    else
        // bajar el zoom
        map.zoomOut();
});