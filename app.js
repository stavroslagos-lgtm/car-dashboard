// --- SPEED ---
function updateSpeed(position) {
    let speed = position.coords.speed; // m/s
    if (speed === null) speed = 0;
    let kmh = (speed * 3.6).toFixed(1);
    document.getElementById("speed").innerText = kmh + " km/h";
}

// --- MAP ---
let map = L.map('map').setView([35.3387, 25.1442], 13); // Κρήτη ως αρχικό σημείο

// Tile layer (χάρτης)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Marker για το αυτοκίνητο
let marker = L.marker([35.3387, 25.1442]).addTo(map);

// Παρακολούθηση GPS
navigator.geolocation.watchPosition(function(position) {
    updateSpeed(position);

    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    // Μετακίνηση marker
    marker.setLatLng([lat, lon]);

    // Follow mode
    map.setView([lat, lon]);
}, 
function(error) {
    console.log("GPS error:", error);
}, 
{
    enableHighAccuracy: true,
    maximumAge: 0
});
function showScreen(name) {
    // Κρύβουμε όλες τις οθόνες
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Εμφανίζουμε τη σωστή οθόνη
    document.getElementById('screen-' + name).classList.add('active');
}

