$(function(){
    localStorage.c = localStorage.c || "0.0";
    localStorage.v = localStorage.v || "[]";

    var t, cl = $("#crono"), lista = $("#vueltas"), vueltas;

    function incr()     { localStorage.c = +localStorage.c + 0.01; };

    function mostrar()  { cl.html((+localStorage.c).toFixed(2)); };

    function cambiar()  { if (!t) arrancar(); else parar(); };

    // Se parsea la variable v de localStorage. Al vector resultante se le aplica
    // join con "<br/>" como separador para que devuelva un string con todos los
    // elementos separados por la etiqueta HTML de salto de línea. Este string
    // se mete en el contenido HTML del elemento lista.
    function mostrarV() { lista.html( JSON.parse(localStorage.v).join("<br/>") );};

    function arrancar() { t = setInterval( function(){incr(); mostrar()}, 10);};

    function parar()    {
        clearInterval(t);  t=undefined;
        
        // Parsea la variable v de localStorage, añade la nueva vuelta y vuelve a
        // convertir a string. Por último, se muestra en pantalla el string actualizado
        vueltas = JSON.parse(localStorage.v);
        vueltas.push( (+localStorage.c).toFixed(2) );
        localStorage.v = JSON.stringify(vueltas);
        mostrarV();
    };

    function limpiar()  {
        if (!t){
            localStorage.c="0.0";   mostrar();
            localStorage.v = "[]";  mostrarV(); // Limpiamos también la lista de vueltas
        }
    };

    // Eventos ligados a window para que el tap y el swipe se puedan
    // hacer en cualquier lugar de la pantalla.
    $(window).on('tap', cambiar);
    $(window).on('swipe', limpiar);

    // Mantenemos la funcionalidad de los botones para las pantallas
    // no táctiles
    $("#cambiar").on('click', cambiar);
    $("#inicializar").on('click', limpiar);

    // Detectamos si el dispositivo tiene pantalla táctil, en cuyo caso
    // eliminamos los botones.
    var is_touch_device = 'ontouchstart' in document.documentElement;
    if(is_touch_device) $("button").hide();

    // Mostramos tanto el cronometro como la lista de vueltas guardada
    mostrar();
    mostrarV();
});
