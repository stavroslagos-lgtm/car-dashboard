/* ----------------------
   ΓΕΝΙΚΕΣ ΜΕΤΑΒΛΗΤΕΣ
---------------------- */
var map;
var marker;
var lastPos = null;
var lastTime = null;
var watchId = null; // για να μπορούμε να σταματήσουμε το watch
var gpsEnabled = false;

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
   ΔΙΑΧΕΙΡΙΣΗ GPS
---------------------- */
function startGPS() {
    if (!navigator.geolocation) {
        debugLog({ error: "Geolocation not supported" });
        return;
    }

    // Αν ήδη υπάρχει watch, το σταματάμε
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    // Πρώτα δοκιμάζουμε getCurrentPosition για να πάρουμε άδεια
    navigator.geolocation.getCurrentPosition(
        function(position) {
            // Επιτυχία: ξεκινάμε το watch
            debugLog({ status: "GPS approved, watching position" });
            gpsEnabled = true;
            watchId = navigator.geolocation.watchPosition(
                function(pos) {
                    updateSpeedFromPosition(pos);
                    var lat = pos.coords.latitude;
                    var lon = pos.coords.longitude;
                    marker.setLatLng([lat, lon]);
                    map.setView([lat, lon]);
                    debugLog({
                        latitude: lat,
                        longitude: lon,
                        accuracy: pos.coords.accuracy,
                        timestamp: new Date(pos.timestamp).toLocaleTimeString()
                    });
                },
                function(error) {
                    debugLog({ gps_error: error.message });
                    gpsEnabled = false;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        },
        function(error) {
            // Αποτυχία λήψης άδειας
            debugLog({ 
                gps_error: error.message,
                suggestion: "Πάτα στην ταχύτητα (0 km/h) για να ζητήσεις πρόσβαση στην τοποθεσία"
            });
            gpsEnabled = false;
        }
    );
}

// Συνάρτηση για να ξαναζητήσει άδεια από τον χρήστη (π.χ. πατώντας στην ταχύτητα)
function requestGeolocation() {
    if (!navigator.geolocation) {
        debugLog({ error: "Geolocation not supported" });
        return;
    }
    debugLog({ status: "Requesting geolocation permission..." });
    startGPS(); // θα κάνει νέα getCurrentPosition
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
        setTimeout(function() { map.invalidateSize(); }, 200);
    }
}

/* ----------------------
   ΡΑΔΙΟΦΩΝΟ (ΑΠΛΟΠΟΙΗΜΕΝΟ, ΑΣΦΑΛΕΣ)
---------------------- */
// Επιλέξτε αν θα χρησιμοποιήσετε CORS proxy
var useProxy = false;   // βάλτε true αν δείτε σφάλματα CORS
var corsProxy = "https://corsproxy.io/?";

var radioStations = [
    { freq: 95.2, name: "Athens DeeJay", url: "http://netradio.live24.gr/athensdeejay952", logo: "https://www.live24.gr/wp-content/uploads/athensdeejay-logo.png" },
    { freq: 92.9, name: "Kiss FM", url: "http://kissfm.live24.gr/kissfmathens", logo: "https://www.live24.gr/wp-content/uploads/kiss-logo.png" },
    { freq: 92.6, name: "Best FM", url: "http://best.live24.gr/bestathinas", logo: "https://www.live24.gr/wp-content/uploads/best-logo.png" },
    { freq: 88.1, name: "Radio 1 (Ηράκλειο)", url: "http://radio1.gr:8000/radio1", logo: "https://radio1.gr/radio1_logo.png" },
    { freq: 90.4, name: "Radio Crete", url: "http://stream.radiocreta.gr:8000/radiocreta", logo: "https://www.radiocreta.gr/images/logo.png" },
    { freq: 88.9, name: "Kriti FM", url: "http://live.radiostudio.gr/kritifm", logo: "https://www.kritifm.gr/images/logo.png" },
    { freq: 88.0, name: "ERA Sport", url: "http://radiostreaming.ert.gr/ert-sports", logo: "https://www.ert.gr/wp-content/themes/ert/assets/images/ert-logo.png" },
    { freq: 90.1, name: "ERA Proto", url: "http://radiostreaming.ert.gr/ert-proto", logo: "https://www.ert.gr/wp-content/themes/ert/assets/images/ert-logo.png" }
];

// Εφαρμογή proxy αν χρειάζεται
if (useProxy) {
    for (var i = 0; i < radioStations.length; i++) {
        radioStations[i].url = corsProxy + encodeURIComponent(radioStations[i].url);
    }
}
var currentStationIndex = 0;
var audioElement = null;
var isRadioPlaying = false;

function updateRadioUI() {
    var station = radioStations[currentStationIndex];
    if (!station) return;
    document.getElementById('freqDisplay').innerText = station.freq.toFixed(1) + ' MHz';
    document.getElementById('stationName').innerText = station.name;
    document.getElementById('stationLogo').src = station.logo;
    var indicator = document.getElementById('indicator');
    if (indicator) {
        var minFreq = 87.5, maxFreq = 108.0;
        var percent = (station.freq - minFreq) / (maxFreq - minFreq) * 100;
        percent = Math.min(100, Math.max(0, percent));
        indicator.style.left = percent + '%';
    }
}

function playRadio() {
    if (!audioElement) {
        audioElement = new Audio();
        audioElement.crossOrigin = "anonymous";
    }
    var station = radioStations[currentStationIndex];
    if (!station) return;
    if (audioElement.src !== station.url) {
        audioElement.src = station.url;
    }
    var promise = audioElement.play();
    if (promise !== undefined) {
        promise.then(function() {
            isRadioPlaying = true;
            document.getElementById('songInfo').innerText = 'Παίζει...';
        }).catch(function(e) {
            console.log("Audio error:", e);
            document.getElementById('songInfo').innerText = 'Δεν μπορεί να παίξει (CORS/format)';
            isRadioPlaying = false;
        });
    } else {
        isRadioPlaying = true;
        document.getElementById('songInfo').innerText = 'Παίζει...';
    }
}

function stopRadio() {
    if (audioElement) {
        audioElement.pause();
        isRadioPlaying = false;
        document.getElementById('songInfo').innerText = 'Σταμάτησε';
    }
}

function prevStation() {
    currentStationIndex--;
    if (currentStationIndex < 0) currentStationIndex = radioStations.length - 1;
    updateRadioUI();
    if (isRadioPlaying) playRadio();
}

function nextStation() {
    currentStationIndex++;
    if (currentStationIndex >= radioStations.length) currentStationIndex = 0;
    updateRadioUI();
    if (isRadioPlaying) playRadio();
}

/* ----------------------
   ΕΚΚΙΝΗΣΗ
---------------------- */
function init() {
    initMap();
    // Δεν ξεκινάμε αυτόματα το GPS για να μην εμφανιστεί το μήνυμα άδειας χωρίς interaction
    // Αντίθετα, δίνουμε τη δυνατότητα στον χρήστη να πατήσει στην ταχύτητα
    debugLog({ status: "App ready. Πατήστε στην ταχύτητα (0 km/h) για GPS" });
    updateRadioUI();

    // Προσθέτουμε listener στο speed div για να ζητήσει GPS
    var speedDiv = document.getElementById('speed');
    if (speedDiv) {
        speedDiv.style.cursor = 'pointer';
        speedDiv.addEventListener('click', function() {
            requestGeolocation();
        });
    }

    // Για το ραδιόφωνο, χρειάζεται user interaction για ήχο στο iOS
    document.body.addEventListener('touchstart', function() {
        if (!audioElement) {
            audioElement = new Audio();
            audioElement.crossOrigin = "anonymous";
            var station = radioStations[currentStationIndex];
            if (station) audioElement.src = station.url;
        }
    }, { once: true });
}

window.addEventListener('load', init);
