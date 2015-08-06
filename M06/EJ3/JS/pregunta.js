// Declaramos todas las variables
var respuesta, resultado, boton;

// Función que se ejecutará al pulsar el botón
function res() {
    if (respuesta.value === "Cristobal Colón"){
        resultado.innerHTML = "Correcto";
    }
    else{
        resultado.innerHTML = "No es correcto";
        respuesta.value="pruebe otra vez"
    }
}

// Cargamos todos los elementos en sus variables y añadimos
// el manejador de click en el botón con la función res()
function inicializar(){
    respuesta = document.getElementById('respuesta');
    resultado = document.getElementById('resultado');
    boton =     document.getElementById('boton');

    boton.addEventListener("click", res);
}
