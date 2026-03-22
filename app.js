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
// Αντικατάστησε το τμήμα RADIO με αυτό
var radioStations = [
    { freq: 90.1, name: "Sfera", url: "https://sfera.live24.gr/sfera4132", logo: "https://live24.gr/resrc/styles/custom-popups/sfera/images/logo.png" },
];
var currentStationIndex = 0;
var audioElement = null;
var isRadioPlaying = false;

function debugRadio(msg) {
    var el = document.getElementById("debugText");
    if (el) {
        el.innerText = (el.innerText || "") + "\n[Radio] " + msg;
    }
}

function updateRadioUI() {
    var station = radioStations[currentStationIndex];
    if (!station) return;
    var freqDisplay = document.getElementById('freqDisplay');
    var stationName = document.getElementById('stationName');
    var stationLogo = document.getElementById('stationLogo');
    var indicator = document.getElementById('indicator');
    if (freqDisplay) freqDisplay.innerText = station.freq.toFixed(1) + ' MHz';
    if (stationName) stationName.innerText = station.name;
    if (stationLogo) stationLogo.src = station.logo;
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
        audioElement.onerror = function(e) {
            var err = audioElement.error;
            debugRadio("Audio error: code=" + (err ? err.code : "unknown") + " msg=" + (err ? err.message : ""));
            document.getElementById('songInfo').innerText = 'Σφάλμα ήχου';
        };
    }
    var station = radioStations[currentStationIndex];
    if (!station) return;
    if (audioElement.src !== station.url) {
        debugRadio("Loading HLS stream: " + station.url);
        audioElement.src = station.url;
        audioElement.load();
    }
    var promise = audioElement.play();
    if (promise !== undefined) {
        promise.then(function() {
            debugRadio("Playback started");
            isRadioPlaying = true;
            document.getElementById('songInfo').innerText = 'Παίζει...';
        }).catch(function(e) {
            debugRadio("Playback error: " + e.message);
            document.getElementById('songInfo').innerText = 'Σφάλμα: ' + e.message;
            isRadioPlaying = false;
        });
    } else {
        debugRadio("Playback without promise");
        isRadioPlaying = true;
        document.getElementById('songInfo').innerText = 'Παίζει...';
    }
}

function stopRadio() {
    if (audioElement) {
        audioElement.pause();
        isRadioPlaying = false;
        document.getElementById('songInfo').innerText = 'Σταμάτησε';
        debugRadio("Stopped");
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

// Κλήση updateRadioUI κατά την εκκίνηση
updateRadioUI();

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

// Απλός έλεγχος Audio
document.addEventListener('DOMContentLoaded', function() {
    var debug = document.getElementById('debugText');
    if (debug) debug.innerText = "App loaded. Click button to test audio.";
    
    // Δημιουργία κουμπιού δοκιμής αν δεν υπάρχει
    if (!document.getElementById('testAudioBtn')) {
        var testBtn = document.createElement('button');
        testBtn.id = 'testAudioBtn';
        testBtn.innerText = 'Test Audio (beep)';
        testBtn.style.position = 'absolute';
        testBtn.style.bottom = '80px';
        testBtn.style.left = '10px';
        testBtn.style.zIndex = '9999';
        testBtn.onclick = function() {
            var audio = new Audio();
            audio.src = 'data:audio/wav;base64,U3RlYW0gZGF0YSBpcyBub3QgcmVhbCwgYnV0IHRoaXMgaXMgYSB0ZXN0Lg=='; // δεν είναι πραγματικό wav, αλλά θα δούμε αν προσπαθεί
            audio.play().then(function() {
                debug.innerText = "Audio played (but no sound, just test)";
            }).catch(function(e) {
                debug.innerText = "Audio error: " + e.message;
            });
        };
        document.body.appendChild(testBtn);
    }
});
