// Declaramos todas las variables
var peticion, tabla, impar;

// Gestiona las cadenas del tipo this.propiedad o window.propiedad
function sanitizeString(cadena){
    cadena = cadena.replace("this.", "");
    cadena = cadena.replace("window.", "");

    return cadena;
}

function inicializar(){
    tabla = document.getElementById("tabla");
    peticion =  sanitizeString(
                    prompt("Introduzca un objeto del DOM para su inspección.")
                );

    while( !window.hasOwnProperty(peticion) ){
        alert("El nombre introducido no corresponde con ninguna propiedad de window. Inténtelo de nuevo.");
        peticion =  sanitizeString(
            prompt("Introduzca un objeto del DOM para su inspección.")
        );
    }

    // Lo siguiente funciona incluso si peticion=window, ya que window tiene una propiedad de igual nombre, 'window', que se referencia a sí misma. Cosas de JavaScript que molan tanto como raras son.
    peticion = window[peticion];

    impar = true;

    // Iteramos sobre todas las propiedades del objeto
    for( i in peticion ){

        // Guardamos el valor de la propiedad i-ésima
        var valor = peticion[i];

        // Si la propiedad i-ésima es un objeto o una función, reescribimos su valor a "No imprimible"
        if ( typeof(valor) === 'object' || typeof(valor) === 'function' ){
            valor = "Valor no imprimible";
        }

        // Si estamos en fila impar, añadims la clase 'impar' a la fila; si no, no.
        primera_etiqueta = impar ? "<tr class='impar'><td>" : "<tr><td>";
        impar = !impar; // Conmutamos entre impar/par

        // Imprimimos en el HTML la información solicitada
        tabla.innerHTML += primera_etiqueta + i + "</td> <td>" + valor + "</td></tr>";
    }

}
