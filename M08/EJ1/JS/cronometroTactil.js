$(function(){

    var t, cl = $("#crono");

    function mostrar()  { cl.html((+cl.html() + 0.1).toFixed(1)); };
    function arrancar() { t=setInterval(mostrar, 100);};
    function parar()    { clearInterval(t);  t=undefined; };
    function cambiar()  { if (!t) arrancar(); else parar(); };

    // Eventos ligados a window para que el tap y el swipe se puedan
    // hacer en cualquier lugar de la pantalla.
    $(window).on('tap', cambiar);
    $(window).on('swipe', function(){ cl.html("0.0"); });

    // Mantenemos la funcionalidad de los botones para las pantallas
    // no táctiles
    $("#cambiar").on('click', cambiar);
    $("#inicializar").on('click', function(){ cl.html("0.0"); });

    // Detectamos si el dispositivo tiene pantalla táctil, en cuyo caso
    // eliminamos los botones.
    var is_touch_device = 'ontouchstart' in document.documentElement;
    if(is_touch_device) $("button").hide();
});
