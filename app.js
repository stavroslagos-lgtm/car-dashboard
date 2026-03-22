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
        url: "https://flyfm881.live24.gr/flyfm881",
        logo: "https://www.live24.gr/wp-content/uploads/flyfm881-logo.png",
        meta: null
    },
    {
        freq: 105.1,
        name: "Μουσικό Κανάλι",
        url: "https://mousikokanali1051.live24.gr/mousikokanali1051",
        logo: "https://www.live24.gr/wp-content/uploads/mousikokanali-logo.png",
        meta: null
    },

    // --- ΑΘΗΝΑ ---
    {
        freq: 88.0,
        name: "ΕΡΑ ΣΠΟΡ",
        url: "https://erasport.live24.gr/erasport",
        logo: "https://www.live24.gr/wp-content/uploads/eraspor-logo.png",
        meta: null
    },
    {
        freq: 88.6,
        name: "Pepper 96.6",
        url: "https://pepper966.live24.gr/pepper966",
        logo: "https://www.live24.gr/wp-content/uploads/pepper-logo.png",
        meta: null
    },
    {
        freq: 89.2,
        name: "Sfera",
        url: "https://sfera892.live24.gr/sfera892",
        logo: "https://www.live24.gr/wp-content/uploads/sfera-logo.png",
        meta: null
    },
    {
        freq: 89.8,
        name: "Dromos FM",
        url: "https://dromos898.live24.gr/dromos898",
        logo: "https://www.live24.gr/wp-content/uploads/dromos-logo.png",
        meta: null
    },
    {
        freq: 90.1,
        name: "ΕΡΑ ΠΡΩΤΟ",
        url: "https://proto.live24.gr/proto",
        logo: "https://www.live24.gr/wp-content/uploads/proto-logo.png",
        meta: null
    },
    {
        freq: 90.9,
        name: "ΕΡΑ ΤΡΙΤΟ",
        url: "https://trito.live24.gr/trito",
        logo: "https://www.live24.gr/wp-content/uploads/trito-logo.png",
        meta: null
    },
    {
        freq: 91.3,
        name: "Red FM",
        url: "https://red913.live24.gr/red913",
        logo: "https://www.live24.gr/wp-content/uploads/red-logo.png",
        meta: null
    },
    {
        freq: 92.3,
        name: "Λάμψη",
        url: "https://lampsi923.live24.gr/lampsi923",
        logo: "https://www.live24.gr/wp-content/uploads/lampsi-logo.png",
        meta: null
    },
    {
        freq: 92.6,
        name: "Best 92.6",
        url: "https://best926.live24.gr/best926",
        logo: "https://www.live24.gr/wp-content/uploads/best-logo.png",
        meta: null
    },
    {
        freq: 93.2,
        name: "Μελωδία",
        url: "https://melodia932.live24.gr/melodia932",
        logo: "https://www.live24.gr/wp-content/uploads/melodia-logo.png",
        meta: null
    },
    {
        freq: 93.6,
        name: "Kosmos",
        url: "https://kosmos936.live24.gr/kosmos936",
        logo: "https://www.live24.gr/wp-content/uploads/kosmos-logo.png",
        meta: null
    },
    {
        freq: 94.3,
        name: "ΣΚΑΪ 100.3",
        url: "https://skai1003.live24.gr/skai1003",
        logo: "https://www.live24.gr/wp-content/uploads/skai-logo.png",
        meta: null
    },
    {
        freq: 94.6,
        name: "Sport FM",
        url: "https://sportfm946.live24.gr/sportfm946",
        logo: "https://www.live24.gr/wp-content/uploads/sportfm-logo.png",
        meta: null
    },
    {
        freq: 95.2,
        name: "Athens DeeJay",
        url: "https://athensdeejay952.live24.gr/athensdeejay952",
        logo: "https://www.live24.gr/wp-content/uploads/athensdeejay-logo.png",
        meta: null
    },
    {
        freq: 96.0,
        name: "Rock FM",
        url: "https://rockfm960.live24.gr/rockfm960",
        logo: "https://www.live24.gr/wp-content/uploads/rockfm-logo.png",
        meta: null
    },
    {
        freq: 97.2,
        name: "Easy 97.2",
        url: "https://easy972.live24.gr/easy972",
        logo: "https://www.live24.gr/wp-content/uploads/easy-logo.png",
        meta: null
    },
    {
        freq: 97.8,
        name: "Real FM",
        url: "https://realfm978.live24.gr/realfm978",
        logo: "https://www.live24.gr/wp-content/uploads/realfm-logo.png",
        meta: null
    },
    {
        freq: 98.0,
        name: "Ρυθμός",
        url: "https://rythmos980.live24.gr/rythmos980",
        logo: "https://www.live24.gr/wp-content/uploads/rythmos-logo.png",
        meta: null
    },
    {
        freq: 98.6,
        name: "Derti",
        url: "https://derty986.live24.gr/derty986",
        logo: "https://www.live24.gr/wp-content/uploads/derty-logo.png",
        meta: null
    },
    {
        freq: 99.5,
        name: "Kiss FM",
        url: "https://kissfm995.live24.gr/kissfm995",
        logo: "https://www.live24.gr/wp-content/uploads/kissfm-logo.png",
        meta: null
    },
    {
        freq: 100.3,
        name: "ΣΚΑΪ News",
        url: "https://skai1003.live24.gr/skai1003",
        logo: "https://www.live24.gr/wp-content/uploads/skai-logo.png",
        meta: null
    },
    {
        freq: 102.2,
        name: "Love Radio",
        url: "https://loveradio1022.live24.gr/loveradio1022",
        logo: "https://www.live24.gr/wp-content/uploads/love-logo.png",
        meta: null
    },
    {
        freq: 104.6,
        name: "En Lefko",
        url: "https://enlefko1046.live24.gr/enlefko1046",
        logo: "https://www.live24.gr/wp-content/uploads/enlefko-logo.png",
        meta: null
    },
    {
        freq: 105.5,
        name: "Στο Κόκκινο",
        url: "https://stokokkino1055.live24.gr/stokokkino1055",
        logo: "https://www.live24.gr/wp-content/uploads/kokkino-logo.png",
        meta: null
    },
    {
        freq: 107.1,
        name: "Real Music",
        url: "https://realmusic1071.live24.gr/realmusic1071",
        logo: "https://www.live24.gr/wp-content/uploads/realmusic-logo.png",
        meta: null
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
