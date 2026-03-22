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
    const el = document.getElementById("debugText");
    if (el) {
        el.innerText = JSON.stringify(obj, null, 2);
    }
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
            let speed = dx / dt;
            let kmh = (speed * 3.6).toFixed(1);
            const sp = document.getElementById("speed");
            if (sp) sp.innerText = kmh + " km/h";
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
    const scr = document.getElementById('screen-' + name);
    if (scr) scr.classList.add('active');

    if (name === 'map' && map) {
        setTimeout(() => map.invalidateSize(), 200);
    }
}

// ----------------------
// ANALOG RADIO + LOGO + METADATA
// ----------------------
let radioStations = [
    {
        freq: 88.1,
        name: "Fly FM",
        url: "https://stream.radiojar.com/flyfm881",
        logo: "logos/flyfm.png",
        meta: "https://stream.radiojar.com/flyfm881/metadata"
    },
    {
        freq: 105.1,
        name: "Μουσικό Κανάλι",
        url: "https://sh.onweb.gr:7086/stream",
        logo: "logos/mousiko.png",
        meta: "https://sh.onweb.gr:7086/status-json.xsl"
    }
];

let currentStation = 0;
let radioAnalog = new Audio();

function updateTuner() {
    let station = radioStations[currentStation];

    const freqEl = document.getElementById("freqDisplay");
    const nameEl = document.getElementById("stationName");
    const logoEl = document.getElementById("stationLogo");

    if (freqEl) freqEl.innerText = station.freq + " MHz";
    if (nameEl) nameEl.innerText = station.name;
    if (logoEl) logoEl.src = station.logo;

    let minFreq = 87.5;
    let maxFreq = 108.0;
    let percent = (station.freq - minFreq) / (maxFreq - minFreq);

    const scale = document.getElementById("scale");
    const indicator = document.getElementById("indicator");
    if (scale && indicator) {
        let scaleWidth = scale.offsetWidth;
        indicator.style.left = (percent * scaleWidth) + "px";
    }

    fetchSongInfo();
}

function nextStation() {
    currentStation++;
    if (currentStation >= radioStations.length) currentStation = 0;

    let station = radioStations[currentStation];

    radioAnalog.src = station.url;
    radioAnalog.play().catch(() => {});

    updateTuner();
}

function prevStation() {
    currentStation--;
    if (currentStation < 0) currentStation = radioStations.length - 1;

    let station = radioStations[currentStation];

    radioAnalog.src = station.url;
    radioAnalog.play().catch(() => {});

    updateTuner();
}

function fetchSongInfo() {
    let station = radioStations[currentStation];
    const infoEl = document.getElementById("songInfo");
    if (!station.meta || !infoEl) return;

    fetch(station.meta)
        .then(r => r.json())
        .then(data => {
            let text = "";

            if (data && data.now_playing && data.now_playing.song) {
                text = data.now_playing.song.title;
            } else if (data.icestats && data.icestats.source) {
                if (Array.isArray(data.icestats.source)) {
                    if (data.icestats.source[0].title) {
                        text = data.icestats.source[0].title;
                    }
                } else if (data.icestats.source.title) {
                    text = data.icestats.source.title;
                }
            }

            if (!text) text = "No song info";

            infoEl.innerText = text;
        })
        .catch(() => {
            infoEl.innerText = "No song info";
        });
}

// ----------------------
// ΕΝΑΡΞΗ ΕΦΑΡΜΟΓΗΣ
// ----------------------
window.onload = function () {
    initMap();
    startGPS();
    updateTuner();
};
