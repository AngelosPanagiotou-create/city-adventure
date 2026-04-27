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
let currentTargetIndex = 0; 
let isEventActive = false; 

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
            const accuracy = Math.round(position.coords.accuracy);
            
            // Τώρα περνάμε και την ακρίβεια αλλά και το κείμενο οθόνης για να τα ενημερώνουμε
            checkProximity(userLat, userLng, accuracy, eventContainer, statusText);
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

function checkProximity(userLat, userLng, accuracy, eventContainer, statusText) {
    if (currentTargetIndex >= landmarks.length) return;

    const target = landmarks[currentTargetIndex];
    // Υπολογίζουμε την απόσταση
    const distance = Math.round(calculateDistance(userLat, userLng, target.lat, target.lng));

    // Αν οι μαθητές περπατάνε (δεν διαβάζουν μήνυμα), τους δείχνουμε τα μέτρα σαν ραντάρ!
    if (!isEventActive) {
        statusText.innerHTML = `Απόσταση από επόμενο σημείο: <br><b style="font-size: 1.5rem; color: #e74c3c;">${distance} μέτρα</b> 📍<br><small>(Ακρίβεια GPS: ~${accuracy}m)</small>`;
    }

    // Μόλις φτάσουν στον στόχο
    if (distance <= target.triggerRadius && !isEventActive) {
        isEventActive = true; 
        statusText.innerHTML = "Είστε στο σημείο! 🎉";
        
        eventContainer.innerHTML = `
            <h3>${target.name}</h3>
            <p style="margin-top:10px; margin-bottom:15px;">${target.eventText}</p>
            <button class="menu-btn" style="width: 100%; background-color: #2ecc71;" onclick="nextLandmark()">Συνέχισε την περιπέτεια 🧭</button>
        `;
        eventContainer.classList.remove('hidden');
    }
}

window.nextLandmark = function() {
    currentTargetIndex++; 
    isEventActive = false; 
    
    const eventContainer = document.getElementById('active-event');
    const statusText = document.getElementById('gps-status');
    
    eventContainer.classList.add('hidden'); 
    
    // Αν τελείωσαν όλα τα σημεία
    if (currentTargetIndex >= landmarks.length) {
        statusText.innerHTML = "Η περιπέτεια ολοκληρώθηκε! 🌟";
        eventContainer.innerHTML = `
            <h3>Συγχαρητήρια! 🏆</h3>
            <p style="margin-top:10px;">Ολοκληρώσατε με επιτυχία την περιπέτεια!</p>
        `;
        eventContainer.classList.remove('hidden');
        stopTracking(); 
    } else {
        statusText.innerHTML = "Αναζήτηση επόμενου σημείου... 🧭";
    }
};

function stopTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
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
