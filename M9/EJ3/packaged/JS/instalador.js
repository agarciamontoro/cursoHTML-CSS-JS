$(document).ready(function() {
    var manifestUrl = location.href.replace("index.html","") +'package.manifest';

    if (! navigator.mozApps.installPackage) {
        alert("ERROR: Esta aplicación no es compatible con tu dispositivo.");
        return;
    }

    var req = navigator.mozApps.installPackage(manifestUrl);
    req.onsuccess = function() {
        alert("Instalacion completada."+this.result.origin);
    };
    req.onerror = function() {
        alert("Error de instalación: "+this.error.name);
    };
}
