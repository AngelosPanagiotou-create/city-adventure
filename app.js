const landmarks = [
    {
        id: 1,
        name: "Σημείο Άλφα",
        lat: 38.586022, 
        lng: 23.803733,
        triggerRadius: 20,
        eventText: "Μπράβο! Έφτασες στο πρώτο σημείο. Βλέπεις κάτι περίεργο τριγύρω που να σε οδηγεί στο επόμενο στοιχείο;"
    },
    {
        id: 2,
        name: "Σημείο Βήτα",
        lat: 38.586647,
        lng: 23.803905,
        triggerRadius: 20,
        eventText: "Τέλεια πλοήγηση! Ανακάλυψες το δεύτερο μυστικό. Είσαι έτοιμος για μια μικρή δοκιμασία;"
    }
];

let watchId = null;

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.getElementById(screenId).classList.add('active');

    if (screenId === 'adventure-screen') {
        startTracking();
    } else {
        stopTracking();
    }
}

function startTracking() {
    const statusText = document.getElementById('gps-status');
    const eventContainer = document.getElementById('active-event');

    if (!navigator.geolocation) {
        statusText.innerText = "Το κινητό σου δεν υποστηρίζει GPS!";
        return;
    }

    statusText.innerText = "Εντοπισμός δορυφόρων... 🛰️";

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            statusText.innerText = `Ενεργή παρακολούθηση! Ακρίβεια: ~${Math.round(position.coords.accuracy)}m`;
            checkProximity(userLat, userLng, eventContainer);
        },
        (error) => {
            statusText.innerText = "Σφάλμα. Βεβαιώσου ότι το GPS είναι ανοιχτό!";
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
}

function stopTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function checkProximity(userLat, userLng, eventContainer) {
    let foundLandmark = false;

    for (let i = 0; i < landmarks.length; i++) {
        const distance = calculateDistance(userLat, userLng, landmarks[i].lat, landmarks[i].lng);

        if (distance <= landmarks[i].triggerRadius) {
            eventContainer.innerHTML = `<h3>${landmarks[i].name}</h3><p style="margin-top:10px;">${landmarks[i].eventText}</p>`;
            eventContainer.classList.remove('hidden');
            foundLandmark = true;
            break; 
        }
    }

    if (!foundLandmark) {
        eventContainer.classList.add('hidden');
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}
