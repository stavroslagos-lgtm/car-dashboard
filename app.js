/* ----------------------
   ΓΕΝΙΚΕΣ ΜΕΤΑΒΛΗΤΕΣ
---------------------- */
var map;
var marker;
var lastPos = null;
var lastTime = null;

/* ----------------------
   DEBUG PANEL
---------------------- */
function debugLog(obj) {
    var el = document.getElementById("debugText");
    if (el) {
        el.innerText = JSON.stringify(obj, null, 2);
    }
}

/* ----------------------
   ΥΠΟΛΟΓΙΣΜΟΣ ΤΑΧΥΤΗΤΑΣ
---------------------- */
function distance(lat1, lon1, lat2, lon2) {
    var R = 6371000;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;

    var a =
        Math.pow(Math.sin(dLat / 2), 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.pow(Math.sin(dLon / 2), 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function updateSpeedFromPosition(position) {
    var now = Date.now();

    if (lastPos) {
        var dx = distance(
            lastPos.latitude,
            lastPos.longitude,
            position.coords.latitude,
            position.coords.longitude
        );

        var dt = (now - lastTime) / 1000;

        if (dt > 0) {
            var speed = dx / dt;
            var kmh = (speed * 3.6).toFixed(1);
            var sp = document.getElementById("speed");
            if (sp) sp.innerText = kmh + " km/h";
        }
    }

    lastPos = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    };
    lastTime = now;
}

/* ----------------------
   ΑΡΧΙΚΟΠΟΙΗΣΗ ΧΑΡΤΗ
---------------------- */
function initMap() {
    map = L.map('map').setView([35.3387, 25.1442], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    marker = L.marker([35.3387, 25.1442]).addTo(map);
}

/* ----------------------
   GPS WATCH
---------------------- */
function startGPS() {
    if (!navigator.geolocation) {
        debugLog({ error: "Geolocation not supported" });
        return;
    }

    navigator.geolocation.watchPosition(
        function (position) {
            updateSpeedFromPosition(position);

            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            marker.setLatLng([lat, lon]);
            map.setView([lat, lon]);

            debugLog({
                latitude: lat,
                longitude: lon,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                heading: position.coords.heading,
                speed_raw: position.coords.speed,
                timestamp: new Date(position.timestamp).toLocaleTimeString()
            });
        },
        function (error) {
            debugLog({ gps_error: error.message });
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

/* ----------------------
   ΑΛΛΑΓΗ ΟΘΟΝΩΝ
---------------------- */
function showScreen(name) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }

    var scr = document.getElementById('screen-' + name);
    if (scr) scr.classList.add('active');

    if (name === 'map' && map) {
        setTimeout(function () {
            map.invalidateSize();
        }, 200);
    }
}

/* ----------------------
   RADIO DATA
---------------------- */
var radioStations = [
    { freq: 88.1, name: "Fly FM", url: "https://flyfm881.live24.gr/flyfm881", logo: "https://www.live24.gr/wp-content/uploads/flyfm881-logo.png", meta: null },
    { freq: 105.1, name: "Μουσικό Κανάλι", url: "https://mousikokanali1051.live24.gr/mousikokanali1051", logo: "https://www.live24.gr/wp-content/uploads/mousikokanali-logo.png", meta: null },
    { freq: 88.0, name: "ΕΡΑ ΣΠΟΡ", url: "https://erasport.live24.gr/erasport", logo: "https://www.live24.gr/wp-content/uploads/eraspor-logo.png", meta: null },
    { freq: 88.6, name: "Pepper 96.6", url: "https://pepper966.live24.gr/pepper966", logo: "https://www.live24.gr/wp-content/uploads/pepper-logo.png", meta: null },
    { freq: 89.2, name: "Sfera", url: "https://sfera892.live24.gr/sfera892", logo: "https://www.live24.gr/wp-content/uploads/sfera-logo.png", meta: null },
    { freq: 89.8, name: "Dromos FM", url: "https://dromos898.live24.gr/dromos898", logo: "https://www.live24.gr/wp-content/uploads/dromos-logo.png", meta: null },
    { freq: 90.1, name: "ΕΡΑ ΠΡΩΤΟ", url: "https://proto.live24.gr/proto", logo: "https://www.live24.gr/wp-content/uploads/proto-logo.png", meta: null },
    { freq: 90.9, name: "ΕΡΑ ΤΡΙΤΟ", url: "https://trito.live24.gr/trito", logo: "https://www.live24.gr/wp-content/uploads/trito-logo.png", meta: null },
    { freq: 91.3, name: "Red FM", url: "https://red913.live24.gr/red913", logo: "https://www.live24.gr/wp-content/uploads/red-logo.png", meta: null },
    { freq: 92.3, name: "Λάμψη", url: "https://lampsi923.live24.gr/lampsi923", logo: "https://www.live24.gr/wp-content/uploads/lampsi-logo.png", meta: null },
    { freq: 92.6, name: "Best 92.6", url: "https://best926.live24.gr/best926", logo: "https://www.live24.gr/wp-content/uploads/best-logo.png", meta: null },
    { freq: 
