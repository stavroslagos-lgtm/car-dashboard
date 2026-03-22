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
// ----------------------
// ANALOG RADIO TUNER
// ----------------------

let radioStations = [
    { freq: 87.7, name: "Δίεση", url: "https://stream.radiojar.com/8s5u5tpdtwzuv" },
    { freq: 88.0, name: "ΕΡΑ ΣΠΟΡ", url: "https://radiostreaming.ert.gr/ert-erasport" },
    { freq: 88.6, name: "Pepper", url: "https://stream.radiojar.com/pepper" },
    { freq: 89.2, name: "Sfera", url: "https://stream.radiojar.com/sfera" },
    { freq: 90.1, name: "ΕΡΑ 1", url: "https://radiostreaming.ert.gr/ert-proto" },
    { freq: 91.3, name: "Red", url: "https://stream.radiojar.com/red" },
    { freq: 92.3, name: "Λάμψη", url: "https://stream.radiojar.com/lampsi" },
    { freq: 93.2, name: "Μελωδία", url: "https://stream.radiojar.com/melodia" },
    { freq: 94.3, name: "ΣΚΑΪ", url: "https://stream.skai.gr/skai" },
    { freq: 95.2, name: "Athens DeeJay", url: "https://stream.radiojar.com/athensdeejay" },
    { freq: 96.0, name: "Rock FM", url: "https://stream.radiojar.com/rockfm" },
    { freq: 98.0, name: "Ρυθμός", url: "https://stream.radiojar.com/rythmos" },
    { freq: 99.5, name: "Kiss FM", url: "https://stream.radiojar.com/kissfm" },
    { freq: 100.3, name: "ΣΚΑΪ News", url: "https://stream.skai.gr/skai1003" },
    { freq: 102.2, name: "Love Radio", url: "https://stream.radiojar.com/love" },
    { freq: 104.6, name: "En Lefko", url: "https://stream.radiojar.com/enlefko" },
    { freq: 105.5, name: "Στο Κόκκινο", url: "https://stream.radiojar.com/kokkino" }
];

let currentStation = 0;
let radioAnalog = new Audio();

function updateTuner() {
    let station = radioStations[currentStation];

    document.getElementById("freqDisplay").innerText = station.freq + " MHz";
    document.getElementById("stationName").innerText = station.name;

    // Move indicator
    let minFreq = 87.5;
    let maxFreq = 108.0;
    let percent = (station.freq - minFreq) / (maxFreq - minFreq);

    let scaleWidth = document.getElementById("scale").offsetWidth;
    let indicator = document.getElementById("indicator");

    indicator.style.left = (percent * scaleWidth) + "px";
}

function nextStation() {
    currentStation++;
    if (currentStation >= radioStations.length) currentStation = 0;

    let station = radioStations[currentStation];

    radioAnalog.src = station.url;
    radioAnalog.play();

    updateTuner();
}

function stopRadio() {
    radioAnalog.pause();
    radioAnalog.src = "";
}

// Initialize tuner on load
window.onload = function () {
    initMap();
    startGPS();
    updateTuner();
};
