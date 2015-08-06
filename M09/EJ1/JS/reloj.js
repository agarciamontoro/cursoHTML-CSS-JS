// Funciones auxiliares para cálculo de coordenadas.
function x2(n,i,x1,r) {return x1 + r*Math.sin(2*Math.PI*n/i);};
function y2(n,i,y1,r) {return y1 - r*Math.cos(2*Math.PI*n/i);};

// Arrays auxiliares para convertir meses y días de números a sus nombres.
var nombreMeses =   ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
                     "JUL", "AGO", "SEP", "OCT", "NOV", "DEC"];
// El primer día de la semana en Date() es el domingo.
var nombreDias =    ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

// Ejecutamos el script sólo cuando el DOM está cargado completamente.
$( document ).ready(function(){
    // Puede ocurrir que el DOM esté cargado completamente y que el SVG no lo esté.
    // Para esperar a que esté cargado, miramos cada segundo si existe.
    var svgDoc;
    var temp = window.setInterval(esperarCarga, 1000);

    // Función que se ejecuta cada 10 milisegundos. No hace nada si el SVG no está
    // aún cargado; elimina el temporizador y llama al resto del código si el SVG
    // está cargado.
    function esperarCarga(){
        //Recupera el DOM interno de  reloj.svg, que está en el object con id #vector.
        svgDoc = document.getElementById("vector").contentDocument;

        // Si existe, eliminamos el intervalo y ejecutamos el núcleo del código,
        // que se encuentra encapsulado en la función reloj().
        if(svgDoc){
            clearInterval(temp);
            reloj();
        }
    }

    // Función que implementa toda la lógica del programa, y que se ejecuta si y sólo si
    // el SVG está cargado, gracias al setInterval y a la función esperarCarga que declaramos antes.
    function reloj(){

        // Recuperamos todos los elementos que nos interesan del SVG.
        var seg = svgDoc.getElementById("seg");
        var min = svgDoc.getElementById("min");
        var hor = svgDoc.getElementById("hor");
        var dec = svgDoc.getElementById("dec");
        var tex = svgDoc.getElementById("tex");
        var texFec = svgDoc.getElementById("fechaDia");

        // Función que muestra la fecha (se ejecutará cada segundo).
        function mostrar_fecha() {
            //Obtenemos la fecha.
            var d = new Date();

            //Obtenemos los campos que nos interesan de la fecha.
            var diaSemana = nombreDias[d.getDay()]; //Día de la semana en nombre.
            var dia = d.getDate(); //Día del mes.
            var mes = nombreMeses[d.getMonth()]; //Mes en nombre.
            var ano = d.getFullYear().toString().substr(2); //Dos últimos dígitos del año.

            //Sí el día del mes tiene un solo dígito, le anteponemos un 0.
            dia = dia < 10 ? "0"+dia : dia;

            //Metemos un string con la fecha en el elemento #fechaDia del SVG.
            $(texFec).html(diaSemana + " " + dia + " " + mes + " " + ano);
        }

        // Función que muestra la hora (se ejecutará cada 10 milisegundos).
        function mostrar_hora( ) {
            //Obtenemos la fecha.
            var d = new Date();

            //Obtenemos los campos que nos interesan de la fecha.
            var h = d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();
            var c = d.getMilliseconds()/100; //Décimas de segundo.

            //Si los números tienen un solo dígito, se les antepone un 0.
            h = h < 10 ? "0"+h : h;
            m = m < 10 ? "0"+m : m;
            s = s < 10 ? "0"+s : s;

            //Metemos un string con la hora digital en el elemento #tex del SVG.
            $(tex).html(h + ":" + m + ":" + s);

            //Calculamos las coordenadas de todas las manecillas con las funciones x2, y2.
            $(seg).attr('x2', x2(s,60,100,48)).attr('y2', y2(s,60,70,48));
            $(min).attr('x2', x2(m,60,100,40)).attr('y2', y2(m,60,70,40));
            $(hor).attr('x2', x2(h,12,100,30)).attr('y2', y2(h,12,70,30));
            $(dec).attr('x2', x2(c,10,100,7 )).attr('y2', y2(c,10,100,7));
        }

        // La hora se actualiza cada 10 milisegundos (para actualizar la miniesfera con fluidez).
        setInterval(function(){mostrar_hora();}, 10);
        // La fecha se actualiza cada segundo.
        setInterval(function(){mostrar_fecha();}, 1000);

        // Mostramos fecha y hora por primera vez sin esperar al primer evento del intervalo.
        mostrar_hora();
        mostrar_fecha();
    }
});


// ACLARACIÓN: Se podría haber separado el temporizador de las décimas de segundo del correspondiente
// del reloj general, de manera que sólo la miniesfera se actualizara cada 10 milisegundos y el reloj
// lo hiciera cada segundo (es lo mínimo que necesita). Lo que ocurre si se separan en dos
// setInterval() distintos es que no se sincroniza el movimiento del segundero con el paso de la
// manecilla de décimas de segundo por el 12, ya que se ejecutan en temporizadores independientes. He
// preferido mantener la estética y darle algo más de realismo al reloj que optimizar la eficiencia
// del código.
