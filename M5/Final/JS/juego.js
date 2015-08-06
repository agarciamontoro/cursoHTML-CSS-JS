function num(){
    return Math.ceil(3*Math.random());
}

// Genera el número y pide al usuario que introduzca su suposición
var num_generado = num();
var respuesta = prompt("¡Intente adivinar el número! (邂逅相遇是一只公鸡的脸!)");

var color; //Variable que contiene el string de la clase que se le asigna al div de respuesta
var string;//Variable que contiene el mensaje que se imprimirá

//Según haya acertado o no, elegimos una clase u otra y ponemos el mensaje correspondiente
if(respuesta == num_generado){
    color = "verde";
    mensaje ="¡Correcto, eres un adivino! (我讨厌流行的聚会所以我是！)";
}
else{
    color = "rojo"
    mensaje = "Lo siento, el número era " + num_generado + ". (对不起，这个数字是一个你没有任何他妈的想法)"
}

//Añadimos la clase correspondiente al elemento HTML cuyo id es "respuesta"
document.getElementById("respuesta").className = color;

//Escribimos el mensaje
document.write(mensaje);
