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
    // --- ΗΡΑΚΛΕΙΟ ---
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
    },

    // --- ΑΘΗΝΑ ---
    {
        freq: 88.6,
        name: "Pepper 96.6",
        url: "https://stream.radiojar.com/pepper",
        logo: "logos/pepper.png",
        meta: "https://stream.radiojar.com/pepper/metadata"
    },
    {
        freq: 89.2,
        name: "Sfera",
        url: "https://sfera.live24.gr/sfera4132",
        logo: "logos/sfera.png",
        meta: "https://sfera.live24.gr/status-json.xsl"
    },
    {
        freq: 91.3,
        name: "Red FM",
        url: "https://stream.radiojar.com/red",
        logo: "logos/red.png",
        meta: "https://stream.radiojar.com/red/metadata"
    },
    {
        freq: 92.3,
        name: "Λάμψη",
        url: "https://stream.radiojar.com/lampsi",
        logo: "logos/lampsi.png",
        meta: "https://stream.radiojar.com/lampsi/metadata"
    },
    {
        freq: 93.2,
        name: "Μελωδία",
        url: "https://stream.radiojar.com/melodia",
        logo: "logos/melodia.png",
        meta: "https://stream.radiojar.com/melodia/metadata"
    },
    {
        freq: 94.3,
        name: "ΣΚΑΪ 100.3",
        url: "https://stream.skai.gr/skai1003",
        logo: "logos/skai.png",
        meta: null
    },
    {
        freq: 95.2,
        name: "Athens DeeJay",
        url: "https://stream.radiojar.com/athensdeejay",
        logo: "logos/athensdeejay.png",
        meta: "https://stream.radiojar.com/athensdeejay/metadata"
    },
    {
        freq: 96.0,
        name: "Rock FM",
        url: "https://stream.radiojar.com/rockfm",
        logo: "logos/rockfm.png",
        meta: "https://stream.radiojar.com/rockfm/metadata"
    },
    {
        freq: 98.0,
        name: "Ρυθμός",
        url: "https://stream.radiojar.com/rythmos",
        logo: "logos/rythmos.png",
        meta: "https://stream.radiojar.com/rythmos/metadata"
    },
    {
        freq: 99.5,
        name: "Kiss FM",
        url: "https://stream.radiojar.com/kissfm",
        logo: "logos/kissfm.png",
        meta: "https://stream.radiojar.com/kissfm/metadata"
    },
    {
        freq: 100.3,
        name: "ΣΚΑΪ News",
        url: "https://stream.skai.gr/skai",
        logo: "logos/skai.png",
        meta: null
    },
    {
        freq: 102.2,
        name: "Love Radio",
        url: "https://stream.radiojar.com/love",
        logo: "logos/love.png",
        meta: "https://stream.radiojar.com/love/metadata"
    },
    {
        freq: 104.6,
        name: "En Lefko",
        url: "https://stream.radiojar.com/enlefko",
        logo: "logos/enlefko.png",
        meta: "https://stream.radiojar.com/enlefko/metadata"
    },
    {
        freq: 105.5,
        name: "Στο Κόκκινο",
        url: "https://stream.radiojar.com/kokkino",
        logo: "logos/kokkino.png",
        meta: "https://stream.radiojar.com/kokkino/metadata"
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
