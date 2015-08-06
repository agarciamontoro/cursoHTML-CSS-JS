/**
 * @file SkypeC2CTelemetry.js
 * @brief JS implementation of the telemetry class to send metrics to dataRV.
 */

'use strict';

var SkypeC2CTelemetry = {

    XHRSupportsCORS : function() {
        return ('withCredentials' in new XMLHttpRequest());
    },
    
    XDRSupported : function() {
        return (typeof XDomainRequest !== "undefined");
    },
    
    // Implement JSON.stringify serialization
    // since older version of IE(<8) dont support JSON
    JsonStringify : function (obj) {

        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // Simple data type
            if (t == "string") {
                obj = '"'+obj+'"';
            }
            return String(obj);
        }
        else {
            // Recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);

            for (n in obj) {
                v = obj[n]; t = typeof(v);
                if (t == "string") {
                    v = '"'+v+'"';
                }
                else if (t == "object" && v !== null) {
                    v = this.JsonStringify(v);
                }
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    },

    formatAsHex : function (n) {
        var hex = n.toString(16),
            padding = 4 - hex.length,
            i;

        for (i = 0; i < padding; i++) {
            hex = "0" + hex;
        }

        return hex;
    },

    createGuid : function () {
        var r = new Array(8),
            val,
            i;

        for (i = 0; i < r.length; i += 2) {
            val = Math.floor(Math.random() * 0x100000000);
            r[i] = this.formatAsHex(val & 0xFFFF);
            r[i + 1] = this.formatAsHex(val >>> 16);

            if ((i + 1) === 3) {
                // RFC4122 requires a 4 in this position
                r[i + 1] = '4' + r[i + 1].substring(1);
            }
        }

        return r[0] + r[1] + "-" + r[2] + "-" + r[3] + "-" +
               r[4] + "-" + r[5] + r[6] + r[7];
    },

    createPacket : function(eventType, isPluginSpecific, userPassedKVPs) {
        var guid = this.createGuid();
        var timestamp = new Date().getTime();
        var packet = {
            "data_package_id": guid,
            "timestamp": timestamp,
            "source": "C2C",
            "version": getProductVersion(),
            "type": "Service",
            "ids": { "service_id": "1"},
            "schema": 2,

            "records": [
                {
                    "id": guid,
                    "timestamp": timestamp,
                    "event_type": (( isPluginSpecific ) ? "C2C_plugin_" : "C2C_") + eventType,
                    "type": "browser_metric"
                }
            ]
        };

        packet.records[0].extension = userPassedKVPs;
        packet.records[0].extension.ReferrerUrl = userPassedKVPs.ReferrerUrl || window.location.href.split("?")[0].split("#")[0];
        
        // If its a local file then make it a fixed path for privacy
        if(packet.records[0].extension.ReferrerUrl.indexOf("file:") === 0) {
            packet.records[0].extension.ReferrerUrl = "file://localpath";
        }
        
        packet.records[0].extension.Browser = navigator.userAgent;
        packet.records[0].extension.Component = "plugin";

        return packet;
    },

    post : function(endpoint, eventType, isPluginSpecific, userPassedKVPs) {

        if (endpoint === "") return;

        var packet = this.createPacket(eventType, isPluginSpecific, userPassedKVPs);

        // Callback function when the ajax response is ready
        var logAjaxResult = function()
        {
            /*
            console.log("Got back an ajax response");
            if (ajaxReq.readyState == 4 && ajaxReq.status == 200)
            {
                console.log("Metrics reported successfully to data RV");
            }
            */
        }

        // Stringify the json packet we created
        // Use JSON if available, if not revert to our own custom method
        var packetStr = ""
        try
        {
            packetStr = JSON.stringify(packet);
        }
        catch(e)
        {
            packetStr = this.JsonStringify(packet);
        }

        // Detect browser support for CORS
        // IE10 onwards we have support for CORS in XHR
        // Chrome and FF will continue using XHR as they support CORS too
        if (this.XHRSupportsCORS()) 
        {
            // Supports cross-domain requests
            var ajaxReq = new XMLHttpRequest();
            ajaxReq.onreadystatechange = logAjaxResult;

            // Set the ajax request headers
            ajaxReq.open("POST", endpoint, true);
            ajaxReq.setRequestHeader("Content-type","application/json");
            ajaxReq.send(packetStr);            
        }
        // Use IE-specific "CORS" code with XDR
        else if(this.XDRSupported())
        {
            xdr = new XDomainRequest();
            xdr.open("POST", endpoint);

            // IE9 has a problem where the request may occasionally be aborted. 
            // To prevent this, need to make sure all the handlers are defined,
            // and give some time for the object to be created before sending data
            // allow some time to prep the XDomainRequest prior to send being called
            window.setTimeout(function () {
                xdr.send(packetStr);
            }, 100);
        }
        
    }
};