// Definición del objeto
var y = {x:'hola', y:'qué', z:'tal', t: 'estás'};

// Definición de la variable que contendrá todos los strings
var cadena = "";

// Iteración sobre el objeto 'y' y concantenación de sus atributos
// en la variable cadena
for(i in y){
    cadena += y[i] + " ";
}

// Escritura de la cadena en el documento
document.write(cadena);
