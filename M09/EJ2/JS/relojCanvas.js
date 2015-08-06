// Funciones auxiliares de cálculo de coordenadas
function x2(n,i,x1,r) {return x1 + r*Math.sin(2*Math.PI*n/i);};
function y2(n,i,y1,r) {return y1 - r*Math.cos(2*Math.PI*n/i);};

// Color usado en todo el reloj
var azul = "#456789";

// Arrays auxiliares para convertir meses y días de números a sus nombres.
var nombreMeses =   ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
"JUL", "AGO", "SEP", "OCT", "NOV", "DEC"];
// El primer día de la semana en Date() es el domingo.
var nombreDias =    ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

// Función auxiliar para dibujar líneas
function myLine(ctx,x1,y1,x2,y2,width,color) {
    ctx.beginPath();           // comenzar nueva linea
    ctx.moveTo(x1,y1);         // Comienzo de linea
    ctx.lineTo(x2,y2);         // Final de linea

    ctx.strokeStyle = color;   // color de línea
    ctx.lineWidth = width;     // anchura de linea:  5 puntos

    ctx.stroke();              // dibujar linea
}

// Función auxiliar para dibujar círculos (modificada para poder dibujar círculos rellenos)
function myCircle(ctx,x,y,r,width,color,color_relleno) {
    ctx.beginPath();             // comenzar figura
    // añadir arco (circulo completo):
    ctx.arc(x,y,r,0,2*Math.PI);  //     ctx.arc(x, y, r, start, stop)

    ctx.strokeStyle = color;     // color de la línea del circulo
    ctx.lineWidth = width;       // anchura de la línea del circulo
    ctx.stroke();                // dibujar circulo

    // Si se ha pasado el argumento color_relleno, se colorea el círculo por dentro
    if(typeof color_relleno !== 'undefined'){
        ctx.fillStyle = color_relleno;
        ctx.fill();
    }
}

// Dibuja círculo exterior y centro
function mostrar_esfera(ctx){
    myCircle(ctx,150,150,100,3,azul);   // esfera del reloj
    myCircle(ctx,150,150,10,3,azul,azul);   // Centro1
    myCircle(ctx,150,150,6,0,"white","white");   // Centro2
}

// Dibuja la hora digital
function mostrar_hora_digital(ctx,h,m,s){
    h = h<10 ? "0"+h : h;
    m = m<10 ? "0"+m : m;
    s = s<10 ? "0"+s : s;

    var texto = h + ":" + m + ":" + s;

    ctx.strokeStyle = azul;
    ctx.lineWidth = 1;
    ctx.strokeRect(95, 77, 115, 26);

    ctx.font = '30px Digital';
    ctx.fillStyle = azul;
    ctx.fillText(texto, 95, 100);
}

// Dibuja la fecha
function mostrar_fecha(ctx,dia_sem,dia_mes,mes,ano){
    dia_sem = nombreDias[dia_sem];
    dia_mes = dia_mes<10 ? "0"+dia_mes : dia_mes;
    mes = nombreMeses[mes];
    ano = ano.toString().substr(2);

    var fecha = dia_sem+" "+dia_mes+" "+mes+" "+ano;

    ctx.strokeStyle = azul;
    ctx.lineWidth = 1;
    ctx.strokeRect(164, 142, 81, 16);

    ctx.font = '13px Digital';
    ctx.fillStyle = azul;
    ctx.fillText(fecha, 166, 154);
}

// Dibuja toda la información de la hora: texto y manecillas
function mostrar_hora(ctx) {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var dec = d.getMilliseconds()/100;

    mostrar_hora_digital(ctx,h,m,s);
    mostrar_fecha(ctx,d.getDay(),d.getDate(),d.getMonth(),d.getFullYear());

    mostrar_decimas(ctx,dec);

    myLine(ctx,150,150,x2(h,12,150,55),y2(h,12,150,55),3,azul); // horas
    myLine(ctx,150,150,x2(m,60,150,80),y2(m,60,150,80),2,azul); // min.
    myLine(ctx,150,150,x2(s,60,150,95),y2(s,60,150,95),1,"red"); // seg.
}

// Dibuja el círculo y los centros de la mini-esfera inferior
function mostrar_mini_esfera(ctx){
    myCircle(ctx,150,200,20,3,azul);   // mini-esfera del reloj
    myCircle(ctx,150,200,4,1,azul,azul);   // Centro1
    myCircle(ctx,150,200,1,0,"white","white");   // Centro2
}

// Dibuja la manecilla de las décimas de segundo
function mostrar_decimas(ctx,d){
    myLine(ctx,150,200,x2(d,10,150,18),y2(d,10,200,18),1,azul);
}

// REDIBUJA TODO
function redibujar(ctx){
    ctx.clearRect(0,0,300,300)  // borrar CANVAS
    mostrar_hora(ctx);
    mostrar_mini_esfera(ctx);
    mostrar_esfera(ctx);
}

// FUNCIÓN PRINCIPAL
$(function() {
    var c=document.getElementById("relojCanvas");   // obtiene CANVAS
    if (c.getContext) {                             // CANVAS soportado?
        var ctx = c.getContext("2d");               // define contexto 2D
        redibujar(ctx);                             // Dibuja por primera vez
        setInterval(function(){redibujar(ctx);}, 10)// Redibuja todo cada 10 milisegundos
    }
})
