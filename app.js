function updateSpeed(position) {
    let speed = position.coords.speed; // m/s
    if (speed === null) speed = 0;
    let kmh = (speed * 3.6).toFixed(1);
    document.getElementById("speed").innerText = kmh + " km/h";
}

navigator.geolocation.watchPosition(updateSpeed);
