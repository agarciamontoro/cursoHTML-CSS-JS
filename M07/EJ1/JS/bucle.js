//Metemos todo en la función que se ejecuta una vez cargada la página
$(function(){

    //Declaración de todas las variables
    var num_actual, suma, mensaje;

    //Inicializamos suma a 0 y asignamos una función a la variable mensaje,
    //de manera que imprima con el formato adecuado el número y el string deseados.
    suma = 0;
    mensaje = function(num){
        return "Suma total: " + num + "\nIntroduzca un número o la palabra 'acabar'.";
    };

    //BUCLE PRINCIPAL
    //En la condición leemos la entrada del usuario y a la vez la comparamos con 'acabar'
    while( ( num_actual = prompt(mensaje(suma)) ) !== 'acabar'){
        //Si no es acabar, tenemos que comprobar que sea realmente un número
        if( isNaN(+num_actual) ){
            alert("Entrada errónea, vuelva a intentarlo");
        }
        else{
            //Sumamos el número actual (con + para asegurarnos de que se convierte a número) a la suma parcial que llevamos.
            suma += +num_actual;
        }
    }

    /*
    // No tenemos inicialización de variables ni incrementos. Es más que preferible
    // el uso del bucle while
    for(;( num_actual = prompt(mensaje(suma)) ) !== 'acabar';){
        if( isNaN(+num_actual) ){
            alert("Entrada errónea, vuelva a intentarlo");
        }
        else{
            suma += +num_actual;
        }
    }
    */

    //Una vez hayamos acabado, escribimos la suma total en el div con id #ejercicioJS
    $('#ejercicioJS').html("Suma total = " + suma + ".");

});
