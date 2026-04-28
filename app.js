const landmarks = [
    {
        id: 1,
        name: "Σημείο Άλφα: Η Πρώτη Ανακάλυψη",
        lat: 38.586022, 
        lng: 23.803733,
        triggerRadius: 20,
        eventText: "Μπράβο! Έφτασες στο πρώτο σημείο. Βλέπεις την όμορφη γωνιά της Δίρφυς; Βγάλε μια φωτογραφία το τοπίο για να αποθηκευτεί στην τσάντα σου και να ξεκλειδώσεις το επόμενο στοιχείο!",
        actionType: "camera",
        points: 50,
        badgeName: "Πρώτη Εξερεύνηση 🥉"
    },
    {
        id: 2,
        name: "Σημείο Βήτα: Το Μυστικό Μονοπάτι",
        lat: 38.586647,
        lng: 23.803905,
        triggerRadius: 20,
        eventText: "Τέλεια πλοήγηση! Ανακάλυψες το δεύτερο μυστικό. Πάτα το κουμπί για να πάρεις το μετάλλιό σου!",
        actionType: "standard",
        points: 100,
        badgeName: "Δάσος Master 🥇"
    }
];

let watchId = null;
let currentTargetIndex = 0; 
let isEventActive = false; 
let map = null;
let userMarker = null;
let totalPoints = 0;

// Icons
const redIcon = L.divIcon({ className: 'custom-icon', html: "<div style='background-color:#e74c3c; width:18px; height:18px; border-radius:50%; border:2px solid white;'></div>", iconSize: [18, 18], iconAnchor: [9, 9] });
const greenStarIcon = L.divIcon({ className: 'custom-icon star-icon', html: "<div style='color:#deff9a; font-size:30px; text-shadow: 0 0 5px #000;'>★</div>", iconSize: [30, 30], iconAnchor: [15, 15] });

// Start Game
function startGame() {
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    document.getElementById('main-header').classList.remove('hidden');
    startTracking();
}

// Tabs
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById('tab-' + tabId).classList.add('active');
    
    const icons = document.querySelectorAll('.nav-item');
    if(tabId === 'map') icons[0].classList.add('active');
    if(tabId === 'player') icons[1].classList.add('active');
    if(tabId === 'inventory') icons[2].classList.add('active');
    if(tabId === 'badges') icons[3].classList.add('active');

    if (map) setTimeout(() => map.invalidateSize(), 100);
}

// Sidebar
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

// GPS
function initMap(lat, lng) {
    if (!map) {
        map = L.map('map', {zoomControl: false}).setView([lat, lng], 18); 
        L.tileLayer('./tiles/{z}/{x}/{y}.png', { minZoom: 17, maxZoom: 18, attribution: '© Google' }).addTo(map);
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
        
        let actionButton = '';
        if (target.actionType === "camera") {
            // Κουμπί για άνοιγμα κάμερας!
            actionButton = `<button class="start-btn" onclick="openCamera()" style="width:100%; margin-top:15px; background-color:#3498db; color:white;">Βγάλε Φωτογραφία 📸</button>`;
        } else {
            actionButton = `<button class="start-btn" onclick="completeLandmark()" style="width:100%; margin-top:15px;">ΕΠΟΜΕΝΟ ΣΗΜΕΙΟ 🧭</button>`;
        }

        eventBox.innerHTML = `
            <h3>${target.name}</h3>
            <p>${target.eventText}</p>
            ${actionButton}
        `;
        eventBox.classList.remove('hidden');
        switchTab('map'); 
    }
}

// ------ ΝΕΕΣ ΛΕΙΤΟΥΡΓΙΕΣ ΚΑΜΕΡΑΣ ΚΑΙ ΒΑΘΜΟΛΟΓΙΑΣ ------ //

function openCamera() {
    document.getElementById('camera-input').click(); // Ανοίγει η κάμερα του κινητού
}

function savePhotoToInventory(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoDataUrl = e.target.result;
            
            // 1. Βάλε τη φωτογραφία στο Inventory!
            const inventoryGrid = document.getElementById('inventory-grid');
            inventoryGrid.innerHTML += `
                <div class="inv-item">
                    <img src="${photoDataUrl}" class="inv-photo">
                    <p style="margin-top:5px; font-size:12px;">Φωτό: ${landmarks[currentTargetIndex].name}</p>
                </div>
            `;
            
            // 2. Προχώρα στο επόμενο βήμα!
            alert("Τέλεια λήψη! 📸 Αποθηκεύτηκε στο Σακίδιό σου!");
            completeLandmark();
        };
        reader.readAsDataURL(file); // Μετατρέπει την εικόνα σε κώδικα για να αποθηκευτεί offline
    }
}

function completeLandmark() {
    const target = landmarks[currentTargetIndex];
    
    // Προσθήκη Πόντων & Badge
    totalPoints += target.points;
    document.getElementById('points-display').innerText = totalPoints;
    
    document.getElementById('badges-grid').innerHTML += `
        <div class="inv-item" style="border-color:#f1c40f;">
            <div style="font-size: 30px; margin-bottom:5px;">🏆</div>
            <p style="color:#f1c40f; font-weight:bold;">${target.badgeName}</p>
            <p style="font-size:12px;">+${target.points} pts</p>
        </div>
    `;

    // Επαναφορά για το επόμενο σημείο
    currentTargetIndex++;
    isEventActive = false;
    userMarker.setIcon(redIcon);
    document.getElementById('active-event').classList.add('hidden');
    
    if(currentTargetIndex >= landmarks.length) {
        document.getElementById('gps-status').innerText = "Η περιπέτεια ολοκληρώθηκε! 🏆";
        alert("Συγχαρητήρια! Έχεις μαζέψει όλα τα μετάλλια!");
        switchTab('badges'); // Τους πάμε να δουν τα μετάλλιά τους στο τέλος!
    } else {
        document.getElementById('gps-status').innerText = "Αναζήτηση επόμενου σημείου...";
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
