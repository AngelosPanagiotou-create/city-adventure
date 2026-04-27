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
let currentTargetIndex = 0; // Το πρόγραμμα πλέον θυμάται σε ποιο σημείο βρισκόμαστε!
let isEventActive = false; // Αυτό κλειδώνει το GPS όσο οι μαθητές διαβάζουν το μήνυμα

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

function checkProximity(userLat, userLng, eventContainer) {
    // Αν τελείωσαν τα σημεία ή αν διαβάζουν ήδη ένα μήνυμα, μην κάνεις τίποτα
    if (currentTargetIndex >= landmarks.length || isEventActive) return;

    // Ψάχνουμε ΜΟΝΟ το επόμενο σημείο στη σειρά, όχι όλα ταυτόχρονα
    const target = landmarks[currentTargetIndex];
    const distance = calculateDistance(userLat, userLng, target.lat, target.lng);

    if (distance <= target.triggerRadius) {
        isEventActive = true; // Κλειδώνουμε την οθόνη για να μην αναβοσβήνει αν κουνηθούν
        
        eventContainer.innerHTML = `
            <h3>${target.name}</h3>
            <p style="margin-top:10px; margin-bottom:15px;">${target.eventText}</p>
            <button class="menu-btn" style="width: 100%; background-color: #2ecc71;" onclick="nextLandmark()">Συνέχισε την περιπέτεια 🧭</button>
        `;
        eventContainer.classList.remove('hidden');
    }
}

// Η νέα μαγική λειτουργία για το κουμπί!
window.nextLandmark = function() {
    currentTargetIndex++; // Πάμε στο επόμενο σημείο
    isEventActive = false; // Ξεκλειδώνουμε το GPS για να αρχίσει να ψάχνει ξανά
    
    const eventContainer = document.getElementById('active-event');
    eventContainer.classList.add('hidden'); // Κρύβουμε το παλιό μήνυμα
    
    // Έλεγχος αν τερμάτισαν το παιχνίδι
    if (currentTargetIndex >= landmarks.length) {
        eventContainer.innerHTML = `
            <h3>Συγχαρητήρια! 🏆</h3>
            <p style="margin-top:10px;">Ολοκληρώσατε με επιτυχία την περιπέτεια!</p>
        `;
        eventContainer.classList.remove('hidden');
        stopTracking(); // Σταματάμε το GPS για οικονομία μπαταρίας
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
