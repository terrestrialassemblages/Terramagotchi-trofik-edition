import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
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

// Authenticate user anonymously
signInAnonymously(auth)
.then((userCredential) => {
    // Anonymous user signed in
    user = userCredential.user;
    console.log("Anonymous user ID:", user.uid);

    // Get current instance ID
    const INSTANCE_ID = (new URL(document.location)).searchParams.get("id");
    document.getElementById('instanceID').innerHTML = "Instance: " + INSTANCE_ID;

    // Get DB for current instance
    const instanceDB = ref(database, 'instances/' + INSTANCE_ID);


    // Add user action to current intance table in DB for each of the corresponding element buttons
    // Each entry will have: element, userID, currtime
    const particle_button_click = (type) => {
        const value = { 
            element : type, 
            userID : user.uid, 
            currtime : Date.now()
            }
        push(instanceDB, value)
            .then(() => {
                console.log('Data added to DB: ' + type);
            })
            .catch((error) => {
                console.error('Error adding data: ', error);
            });
    }

    const water_button = document.getElementById('addWater')
    water_button.addEventListener('click', () => {
        particle_button_click('water')
    })

    const sun_button = document.getElementById('addSun')
    sun_button.addEventListener('click', () => {
        particle_button_click('sun')
    })

    const chemical_button = document.getElementById('addChemicals')
    chemical_button.addEventListener('click', () => {
        particle_button_click('chemical')
    })
})
.catch((error) => {
    // Handle errors
    console.error("Error signing in anonymously:", error);
});


