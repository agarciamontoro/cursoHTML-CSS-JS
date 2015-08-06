// Utilizar notacion array para
// acceder a propiedades: obj[i]

for (i in obj) {
  z = z + obj[i];
  obj[i] = "inspected";
}

// En bloques de solo 1 sentencia
// {...} es opcional
//    -> pero se recomienda usarlo

for (i in obj) {
  z = z + obj[i];
}

// Estas 2 formas son equivalentes
// pero menos legibles

for (i in obj)    z = z + obj[i];

for (i in obj)
  z = z + obj[i];