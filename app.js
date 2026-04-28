// ... (κρατάς το landmarks array και τις μεταβλητές GPS όπως ήταν) ...
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
let map = null;
let userMarker = null;

// Icons
const redIcon = L.divIcon({
    className: 'custom-icon',
    html: "<div style='background-color:#e74c3c; width:18px; height:18px; border-radius:50%; border:2px solid white;'></div>",
    iconSize: [18, 18], iconAnchor: [9, 9]
});

const greenStarIcon = L.divIcon({
    className: 'custom-icon star-icon',
    html: "<div style='color:#deff9a; font-size:30px; text-shadow: 0 0 5px #000;'>★</div>",
    iconSize: [30, 30], iconAnchor: [15, 15]
});

// Switch Screens
function startGame() {
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    document.getElementById('main-header').classList.remove('hidden');
    startTracking();
}

// Switch Tabs (TaleBlazer Style)
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById('tab-' + tabId).classList.add('active');
    // Βρίσκουμε το σωστό icon για να το κάνουμε active
    const icons = document.querySelectorAll('.nav-item');
    if(tabId === 'map') icons[0].classList.add('active');
    if(tabId === 'player') icons[1].classList.add('active');
    if(tabId === 'inventory') icons[2].classList.add('active');
    if(tabId === 'history') icons[3].classList.add('active');

    if (map) setTimeout(() => map.invalidateSize(), 100);
}

// Sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// GPS Tracking (όπως πριν, αλλά με ενημέρωση του content-pane)
function initMap(lat, lng) {
    if (!map) {
        map = L.map('map', {zoomControl: false}).setView([lat, lng], 18); 
        L.tileLayer('./tiles/{z}/{x}/{y}.png', {
            minZoom: 17, maxZoom: 18, attribution: '© Google'
        }).addTo(map);
        userMarker = L.marker([lat, lng], {icon: redIcon}).addTo(map);
    }
}

function startTracking() {
    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            if (!map) { initMap(userLat, userLng); } 
            else { map.setView([userLat, userLng]); userMarker.setLatLng([userLat, userLng]); }
            checkProximity(userLat, userLng);
        },
        null, { enableHighAccuracy: true }
    );
}

function checkProximity(lat, lng) {
    if (currentTargetIndex >= landmarks.length) return;
    const target = landmarks[currentTargetIndex];
    const dist = calculateDistance(lat, lng, target.lat, target.lng);
    
    document.getElementById('dist-overlay').innerText = Math.round(dist) + " m";

    if (dist <= target.triggerRadius && !isEventActive) {
        isEventActive = true;
        userMarker.setIcon(greenStarIcon);
        const eventBox = document.getElementById('active-event');
        eventBox.innerHTML = `
            <h3>${target.name}</h3>
            <p>${target.eventText}</p>
            <button class="start-btn" onclick="nextLandmark()" style="width:100%; margin-top:15px;">ΕΠΟΜΕΝΟ ΣΗΜΕΙΟ 🧭</button>
        `;
        eventBox.classList.remove('hidden');
        switchTab('map'); // Αναγκάζουμε την οθόνη να δείξει το μήνυμα
    }
}

function nextLandmark() {
    currentTargetIndex++;
    isEventActive = false;
    userMarker.setIcon(redIcon);
    document.getElementById('active-event').classList.add('hidden');
    document.getElementById('points').innerText = currentTargetIndex + "/2";
    if(currentTargetIndex >= landmarks.length) {
        document.getElementById('gps-status').innerText = "Η περιπέτεια ολοκληρώθηκε! 🏆";
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
