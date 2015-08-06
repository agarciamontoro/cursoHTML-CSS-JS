var map, lat, lng, primera_posicion;

$(function(){
    localStorage.rutas = localStorage.rutas || "[]";

    //Función para guardar un marcador (del tipo GMaps) en localStorage
    function guardarMarcador(e){
        var rutas = JSON.parse(localStorage.rutas);
        rutas.push([e.latLng.lat(), e.latLng.lng()]);
        localStorage.rutas = JSON.stringify(rutas);
    }

    //Función que enlaza marcador con entrada un array de dos elementos
    function enlazarLatLng(e){
        // muestra ruta entre marcas anteriores y actuales
        map.drawRoute({
            origin: [lat, lng],  // origen en coordenadas anteriores
            // destino en coordenadas del click o toque actual
            destination: e,
            travelMode: 'driving',
            strokeColor: '#000000',
            strokeOpacity: 0.6,
            strokeWeight: 5
        });

        lat = e[0];   // guarda coords para marca siguiente
        lng = e[1];

        map.addMarker({ lat: lat, lng: lng});  // pone marcador en mapa
    }

    //Función que enlaza marcador con entrada elemento devuelto por GMaps
    function enlazarMarcador(e){
        enlazarLatLng([e.latLng.lat(),e.latLng.lng()]);
    };

    //Función para nuevos marcadores, cuyas posiciones hay que guardar
    function nuevoMarcador(e){
        enlazarMarcador(e);
        guardarMarcador(e);
    }

    function geolocalizar(){
        GMaps.geolocate({
            success: function(position){
                lat = position.coords.latitude;  // guarda coords en lat y lng
                lng = position.coords.longitude;

                map = new GMaps({  // muestra mapa centrado en coords [lat, lng]
                    el: '#map',
                    lat: lat,
                    lng: lng,
                    click: nuevoMarcador,
                    tap: nuevoMarcador
                });
                map.addMarker({ lat: lat, lng: lng});  // marcador en [lat, lng]

                primera_posicion = [lat,lng];

                var array_rutas = JSON.parse(localStorage.rutas);

                for(var i=0; i<array_rutas.length; ++i){
                    enlazarLatLng(array_rutas[i]);
                }
            },
            error: function(error) { alert('Geolocalización falla: '+error.message); },
            not_supported: function(){ alert("Su navegador no soporta geolocalización"); },
        });
    };

    $("#limpiar").on('click', function(){
        localStorage.rutas="[]";
        map.removeMarkers();
        map.cleanRoute();
        var centro = map.getCenter();

        lat = centro.lat();
        lng = centro.lng();

        map.addMarker({ lat: lat, lng: lng });
        primera_posicion = [lat,lng];
    });

    $("#compactar").on('click', function(){
        var rutas = JSON.parse(localStorage.rutas);

        var ruta_compactada = [ primera_posicion, rutas[rutas.length-1] ];
        localStorage.rutas = JSON.stringify(ruta_compactada);

        map.removeMarkers();
        map.cleanRoute();

        lat = ruta_compactada[0][0];
        lng = ruta_compactada[0][1];

        map.addMarker({ lat: lat, lng: lng });

        enlazarLatLng(ruta_compactada[1]);
    });

    geolocalizar();
});
