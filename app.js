// ----------------------
// ΓΕΝΙΚΕΣ ΜΕΤΑΒΛΗΤΕΣ
// ----------------------
let map;
let marker;
let lastPos = null;
let lastTime = null;

// ----------------------
// DEBUG PANEL
// ----------------------
function debugLog(obj) {
    document.getElementById("debugText").innerText =
        JSON.stringify(obj, null, 2);
}

// ----------------------
// ΥΠΟΛΟΓΙΣΜΟΣ ΤΑΧΥΤΗΤΑΣ
// ----------------------
function distance(lat1, lon1, lat2, lon2) {
    let R = 6371000;
    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLon = (lon2 - lon1) * Math.PI / 180;
    let a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function updateSpeedFromPosition(position) {
    let now = Date.now();

    if (lastPos) {
        let dx = distance(
            lastPos.latitude,
            lastPos.longitude,
            position.coords.latitude,
            position.coords.longitude
        );

        let dt = (now - lastTime) / 1000;

        if (dt > 0) {
            let speed = dx / dt; // m/s
            let kmh = (speed * 3.6).toFixed(1);
            document.getElementById("speed").innerText = kmh + " km/h";
        }
    }

    lastPos = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    };
    lastTime = now;
}

// ----------------------
// ΑΡΧΙΚΟΠΟΙΗΣΗ ΧΑΡΤΗ
// ----------------------
function initMap() {
    map = L.map('map').setView([35.3387, 25.1442], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    marker = L.marker([35.3387, 25.1442]).addTo(map);
}

// ----------------------
// GPS WATCH
// ----------------------
function startGPS() {
    if (!navigator.geolocation) {
        debugLog({ error: "Geolocation not supported" });
        return;
    }

    navigator.geolocation.watchPosition(function (position) {

        updateSpeedFromPosition(position);

        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        marker.setLatLng([lat, lon]);
        map.setView([lat, lon]);

        // DEBUG INFO
        debugLog({
            latitude: lat,
            longitude: lon,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed_raw: position.coords.speed,
            timestamp: new Date(position.timestamp).toLocaleTimeString()
        });

    }, function (error) {
        debugLog({ gps_error: error.message });
    }, {
        maximumAge: 0
    });
}

// ----------------------
// ΑΛΛΑΓΗ ΟΘΟΝΩΝ
// ----------------------
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');

    if (name === 'map' && map) {
        setTimeout(() => map.invalidateSize(), 200);
    }
}

// ----------------------
// ΕΝΑΡΞΗ ΕΦΑΡΜΟΓΗΣ
// ----------------------
window.onload = function () {
    initMap();
    startGPS();
};
