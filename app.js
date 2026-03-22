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
/* ----------------------
   ΡΑΔΙΟΦΩΝΟ (ΑΠΛΟ TEST)
---------------------- */
function prevStation() {
    var debug = document.getElementById('debugText');
    debug.innerText = "prevStation called";
}

function nextStation() {
    var debug = document.getElementById('debugText');
    debug.innerText = "nextStation called";
}

function testPlay() {
    var debug = document.getElementById('debugText');
    debug.innerText = "testPlay called";
    var audio = new Audio();
    audio.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // γνωστό δοκιμαστικό MP3
    audio.play().then(function() {
        debug.innerText = "Playback started successfully!";
    }).catch(function(e) {
        debug.innerText = "Playback error: " + e.message;
    });
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
