//////////////////////////////////////////////////////////////////////////////
//    Script que calcula la superficie de una pared dadas sus medidas       //
//////////////////////////////////////////////////////////////////////////////

//Solicita la altura de la pared al usuario
var altura = prompt("Introduzca la altura de la pared:");

//Solicita la anchura de la pared al usuario
var anchura = prompt("Introduzca la anchura de la pared:");

// Escribe el resultado en el documento
document.write("La pared tiene una superficie de " + altura*anchura + " metros cuadrados.");

// Hace invisible el div ejercicioJS, en el que se imprime el resultado,
// al hacer click en cualquier lugar de la ventana.
window.onclick = function(){
    document.getElementById("ejercicioJS").style.display = "none";
}
