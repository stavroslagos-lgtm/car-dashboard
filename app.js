var map;

function debugLog(obj) {
    var el = document.getElementById("debugText");
    if (el) el.innerText = JSON.stringify(obj, null, 2);
}

function initMap() {
    map = L.map('map').setView([35.3387, 25.1442], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);
    L.marker([35.3387, 25.1442]).addTo(map);
    debugLog({ status: "Map initialized" });
}

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

function init() {
    initMap();
    debugLog({ status: "App loaded, GPS and radio disabled for testing" });
}

window.addEventListener('load', init);
