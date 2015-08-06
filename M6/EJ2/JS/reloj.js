// Función auxiliar para poner singular o plural cuando el número sea igual a 1 o diferente
function ajustarPlural(valor){
    return valor!=1 ? "s" : "";
}

// Formato de hora
function mostrar_hora(){
    var clock = new Date();

    var HH = clock.getHours();
    var MM = clock.getMinutes();
    var SS = clock.getSeconds();
    var MS = clock.getMilliseconds();

    return  "<span class='val'>" + HH + "</span>" + " hora" + ajustarPlural(HH) + ", " +
            "<span class='val'>" + MM + "</span>" + " minuto" + ajustarPlural(MM) + ", " +
            "<span class='val'>" + SS + "</span>" + " segundo" + ajustarPlural(SS) + ", " +
            "<span class='val milis'>" + MS + "</span>" + " milisegundo" + ajustarPlural(MS) + ".";
}

// Función que se ejecutará cada milisegundo
function reescribirHora(){
    document.getElementById("reloj").innerHTML = mostrar_hora();
}

// setInterval devuelve un identificador del temporizador, que lo usaremos después
// para eliminarlo con window.clearInterval(id). Esta variable la usaremos para
// guardar ese identificador, que pondremos a -1 cuando no exista.
var ID_INTERVALO = -1;

// Elimina el temporizador si existe y crea uno nuevo si no existe; es decir:
// para el reloj si está andando y lo arranca de nuevo si estaba parado.
function conmutarReloj(){
    if(ID_INTERVALO === -1){
        ID_INTERVALO = setInterval(reescribirHora,1); //Arrancamos de nuevo el reloj
    }
    else{
        window.clearInterval(ID_INTERVALO); // Paramos el reloj
        ID_INTERVALO = -1;                  // Actualizamos la var global para saber que está parado
    }
}

// Función que se llamará cuando toda el DOM esté cargado
// Selecciona el div "reloj" y le añade el evento
function inicializar(){
    var elemento = document.getElementById("reloj");
    elemento.addEventListener("click", conmutarReloj);
}

// Indicamos que se ejecute reescribirHora cada milisegundo y guardamos el identificador
ID_INTERVALO = setInterval(reescribirHora, 1);
