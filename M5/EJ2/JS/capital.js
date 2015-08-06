var respuesta = prompt("¿Cuál es la capital de España?");

// Uso la función toLowerCase() para convertir la respuesta
// a minúsculas y que no haya problema al comparar con el string "madrid"
if(respuesta.toLowerCase() === "madrid")
    document.write("¡Correcto, Madrid es la capital de España!");
else
    document.write("Su respuesta, \"" + respuesta + "\", no es correcta.");
