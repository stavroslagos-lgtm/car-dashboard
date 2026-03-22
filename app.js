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
   RADIO DATA (πλήρης λίστα)
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
    { freq: 93.2, name: "Enter FM", url: "https://enter.live24.gr/enter", logo: "https://www.live24.gr/wp-content/uploads/enter-logo.png", meta: null },
    { freq: 93.7, name: "Star FM", url: "https://star937.live24.gr/star937", logo: "https://www.live24.gr/wp-content/uploads/star-logo.png", meta: null },
    { freq: 94.2, name: "Kiss FM", url: "https://kiss942.live24.gr/kiss942", logo: "https://www.live24.gr/wp-content/uploads/kiss-logo.png", meta: null },
    { freq: 95.2, name: "Athens DeeJay", url: "https://athensdeejay952.live24.gr/athensdeejay952", logo: "https://www.live24.gr/wp-content/uploads/athensdeejay-logo.png", meta: null },
    { freq: 96.7, name: "Nitro Radio", url: "https://nitro967.live24.gr/nitro967", logo: "https://www.live24.gr/wp-content/uploads/nitro-logo.png", meta: null },
    { freq: 97.1, name: "City FM", url: "https://city971.live24.gr/city971", logo: "https://www.live24.gr/wp-content/uploads/city-logo.png", meta: null },
    { freq: 98.3, name: "Rock FM", url: "https://rock983.live24.gr/rock983", logo: "https://www.live24.gr/wp-content/uploads/rock-logo.png", meta: null },
    { freq: 99.2, name: "Rythmos FM", url: "https://rythmos992.live24.gr/rythmos992", logo: "https://www.live24.gr/wp-content/uploads/rythmos-logo.png", meta: null },
    { freq: 100.3, name: "Love FM", url: "https://love1003.live24.gr/love1003", logo: "https://www.live24.gr/wp-content/uploads/love-logo.png", meta: null },
    { freq: 101.3, name: "Alpha 989", url: "https://alpha989.live24.gr/alpha989", logo: "https://www.live24.gr/wp-content/uploads/alpha-logo.png", meta: null },
    { freq: 102.5, name: "Energy FM", url: "https://energy1025.live24.gr/energy1025", logo: "https://www.live24.gr/wp-content/uploads/energy-logo.png", meta: null },
    { freq: 103.7, name: "Melodia FM", url: "https://melodia1037.live24.gr/melodia1037", logo: "https://www.live24.gr/wp-content/uploads/melodia-logo.png", meta: null },
    { freq: 104.4, name: "Real FM", url: "https://realfm.live24.gr/realfm", logo: "https://www.live24.gr/wp-content/uploads/realfm-logo.png", meta: null },
    { freq: 105.5, name: "Cosmos FM", url: "https://cosmos.live24.gr/cosmos", logo: "https://www.live24.gr/wp-content/uploads/cosmos-logo.png", meta: null },
    { freq: 106.1, name: "Sport FM", url: "https://sportfm.live24.gr/sportfm", logo: "https://www.live24.gr/wp-content/uploads/sportfm-logo.png", meta: null },
    { freq: 107.4, name: "Vima FM", url: "https://vima1074.live24.gr/vima1074", logo: "https://www.live24.gr/wp-content/uploads/vima-logo.png", meta: null }
];

/* ----------------------
   ΡΑΔΙΟΦΩΝΟ – ΜΕΤΑΒΛΗΤΕΣ
---------------------- */
var currentStationIndex = 0;
var audioElement = null;
var isRadioPlaying = false;

/* ----------------------
   ΒΟΗΘΗΤΙΚΗ ΓΙΑ ΤΟ UI ΡΑΔΙΟΦΩΝΟΥ
---------------------- */
function updateRadioUI() {
    var station = radioStations[currentStationIndex];
    if (!station) return;

    var freqDisplay = document.getElementById('freqDisplay');
    var stationName = document.getElementById('stationName');
    var stationLogo = document.getElementById('stationLogo');
    var songInfo = document.getElementById('songInfo');
    var indicator = document.getElementById('indicator');

    if (freqDisplay) freqDisplay.innerText = station.freq.toFixed(1) + ' MHz';
    if (stationName) stationName.innerText = station.name;
    if (stationLogo) stationLogo.src = station.logo;
    if (songInfo) songInfo.innerText = 'Φόρτωση...';

    // Μετακίνηση δείκτη στο tuner (αναλογική κλίμακα 87.5-108.0)
    if (indicator) {
        var minFreq = 87.5, maxFreq = 108.0;
        var percent = (station.freq - minFreq) / (maxFreq - minFreq) * 100;
        percent = Math.min(100, Math.max(0, percent));
        indicator.style.left = percent + '%';
    }
}

/* ----------------------
   ΕΚΚΙΝΗΣΗ / ΣΤΑΜΑΤΗΜΑ ΡΑΔΙΟΦΩΝΟΥ
---------------------- */
function playRadio() {
    if (!audioElement) {
        audioElement = new Audio();
        audioElement.autoplay = false;
        // Σε iOS, ο ήχος χρειάζεται user interaction για να ξεκινήσει
        audioElement.crossOrigin = "anonymous"; // προσπάθεια αποφυγής CORS
    }

    var station = radioStations[currentStationIndex];
    if (!station) return;

    if (audioElement.src !== station.url) {
        audioElement.src = station.url;
    }

    var playPromise = audioElement.play();
    if (playPromise !== undefined) {
        playPromise.then(function() {
            isRadioPlaying = true;
            var songInfo = document.getElementById('songInfo');
            if (songInfo) songInfo.innerText = 'Παίζει...';
        }).catch(function(e) {
            console.log('Αποτυχία αναπαραγωγής:', e);
            var songInfo = document.getElementById('songInfo');
            if (songInfo) songInfo.innerText = 'Χρειάζεται πάτημα για αναπαραγωγή';
            isRadioPlaying = false;
        });
    } else {
        // Fallback για παλιότερα
        isRadioPlaying = true;
        var songInfo = document.getElementById('songInfo');
        if (songInfo) songInfo.innerText = 'Παίζει...';
    }
}

function stopRadio() {
    if (audioElement) {
        audioElement.pause();
        // Δεν κάνουμε reset το src για να μην χάσουμε την προσωρινή μνήμη
    }
    isRadioPlaying = false;
    var songInfo = document.getElementById('songInfo');
    if (songInfo) songInfo.innerText = 'Σταμάτησε';
}

/* ----------------------
   ΕΝΑΛΛΑΓΗ ΣΤΑΘΜΩΝ
---------------------- */
function prevStation() {
    currentStationIndex--;
    if (currentStationIndex < 0) currentStationIndex = radioStations.length - 1;
    updateRadioUI();
    if (isRadioPlaying) {
        playRadio(); // αλλάζει src και ξαναπαίζει
    }
}

function nextStation() {
    currentStationIndex++;
    if (currentStationIndex >= radioStations.length) currentStationIndex = 0;
    updateRadioUI();
    if (isRadioPlaying) {
        playRadio();
    }
}

/* ----------------------
   ΑΡΧΙΚΟΠΟΙΗΣΗ ΟΛΩΝ
---------------------- */
function init() {
    initMap();
    startGPS();
    updateRadioUI();

    // Προσθήκη listener για user interaction (απαραίτητο για ήχο σε iOS)
    // Μόλις ο χρήστης πατήσει οπουδήποτε, δίνουμε τη δυνατότητα να ξεκινήσει ο ήχος
    var userInteracted = false;
    function enableAudio() {
        if (userInteracted) return;
        userInteracted = true;
        // Δημιουργούμε το audio element αν δεν υπάρχει και το φορτώνουμε χωρίς να παίζει
        if (!audioElement) {
            audioElement = new Audio();
            audioElement.crossOrigin = "anonymous";
            var station = radioStations[currentStationIndex];
            if (station) {
                audioElement.src = station.url;
                audioElement.load(); // προφορτώνει, αλλά δεν παίζει
            }
        }
        console.log('Audio enabled by user interaction');
    }
    document.body.addEventListener('touchstart', enableAudio, { once: true });
    document.body.addEventListener('click', enableAudio, { once: true });
}

// Εκκίνηση μόλις φορτώσει η σελίδα
window.addEventListener('load', init);
