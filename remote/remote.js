import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Firebase related variables
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCWXtadqvzfXVN95olGEmOVrozV8SVqONs",
    authDomain: "terramagotchi-trofik-edition.firebaseapp.com",
    databaseURL: "https://terramagotchi-trofik-edition-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "terramagotchi-trofik-edition",
    storageBucket: "terramagotchi-trofik-edition.appspot.com",
    messagingSenderId: "155568148343",
    appId: "1:155568148343:web:ee221579eb985628441b72",
    measurementId: "G-NHB6KJDMR8"
};

// Initialize Firebase
initializeApp(FIREBASE_CONFIG);
const database = getDatabase();
const auth = getAuth();
let user = null;

// Functions for showing and hiding loading spin
const status_text = document.getElementById("status-text");
const spinner = document.getElementById("spinner");



// Function for updating status text and spinner
function updateStatus(text, show_loading_spin = false) {
    if (show_loading_spin) {
        spinner.style.display = "block";
    } else {
        spinner.style.display = "none";
    }
    status_text.innerText = text;
}

// Authenticate user anonymously
signInAnonymously(auth)
.then((userCredential) => {
    // Anonymous user signed in
    user = userCredential.user;
    updateStatus("Logged in as Anonymous User");
    console.log("Logged in, Anonymous user ID:", user.uid);

    // Get current instance ID
    const INSTANCE_ID = (new URL(document.location)).searchParams.get("id");
    document.getElementById('instanceID').innerHTML = "" + INSTANCE_ID;

    // Get DB for current instance
    const instanceDB = ref(database, 'instances/' + INSTANCE_ID);

    // Check if the instance exists, connect
    get(instanceDB)
    .then((snapshot) => {
        if (snapshot.exists()) {
            console.log("Connected to instance: " + INSTANCE_ID);

            // Listener for each of the buttons to add the corresponding action to DB
            // Each entry will have: element, userID, currtime
            const particle_button_click = (type) => {
                updateStatus("Sending...", true);
                const value = { 
                    element : type, 
                    userID : user.uid, 
                    currtime : Date.now()
                    }
                push(instanceDB, value)
                    .then(() => {
                        console.log('Data added to DB: ' + type);
                        updateStatus("Successfully sent " + type);
                    })
                    .catch((error) => {
                        console.error('Error adding data to DB: ', error);
                        updateStatus("Error adding " + type + " please retry");
                    });
            }
            const water_button = document.getElementById('addWater')
            water_button.addEventListener('click', () => {
                particle_button_click('water')
            })
            const sun_button = document.getElementById('addSun')
            sun_button.addEventListener('click', () => {
                particle_button_click('sunlight')
            })
            const chemical_button = document.getElementById('addChemicals')
            chemical_button.addEventListener('click', () => {
                particle_button_click('chemical')
            })
        } else {
            console.log("Instance does not exist");
            updateStatus("Game does not exist, please rescan the QR code");
        }
    }).catch((error) => {
        console.error("Error checking if instance exists in DB:", error);
        updateStatus("Error connecting to the game, please reload the app");
    });
})
.catch((error) => {
    // Handle errors
    console.error("Error signing in anonymously:", error);
    updateStatus("Error signing in anonymously");
});
