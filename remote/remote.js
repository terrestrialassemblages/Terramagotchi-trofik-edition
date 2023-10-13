import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import FIREBASE_CONFIG from "../firebase_config.js";


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

                // Check if the instance exists before adding data to DB
                get(instanceDB)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        updateStatus("Sending...", true);
                        const value = { 
                            element : type, 
                            userID : user.uid, 
                            currtime : Date.now()
                        }
                        push(instanceDB, value)
                        .then(() => {
                            console.log('Data added to DB: ' + type);
                            updateStatus("Successfully sent " + type + "!");
                        })
                        .catch((error) => {
                            console.error('Error adding data to DB: ', error);
                            updateStatus("Error adding " + type + " please retry");
                        });
                    } else {
                        console.log("Game instance does not exist");
                        updateStatus("Game has ended. Please scan a new QR code");
                    }
                })
                .catch((error) => {
                    console.error("Error checking if instance exists in DB:", error);
                    updateStatus("Error connecting to the game, please reload the app");
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
            console.log("Game instance does not exist");
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


// Listener for info buttons. Displays an outline and the corresponding description for the currently selected element.
const buttons = document.querySelectorAll('.infoBtn');
const elementInfo = document.getElementById('elementInfo');
let lastClicked = null;
const descriptions = {
    soilInfo: "Soil is a natural resource housing the various organisms of the soil food web. Darker areas represent more aggregated soil, allowing for better water infiltration and promoting root growth.",
    waterInfo: "Water is an essential element for sustaining all forms of life.",
    rootInfo: "The underground structre of plants allowing the intake of water and nutrients from the soil. They extend and flourish in areas rich in aggregated soil and fungi, optimizing their growth and nourishment.",
    fungiInfo: "The white roots or hyphae of fungi play a crucial role in decomposing organic matter and binding soil particles together, enhancing soil structure and nutrient availability.",
    sugarInfo: "Liquid sugar created from the plant roots feeds the bacteria in the soil.",
    bacteriaInfo: "Bacteria travels around the soil searching for liquid sugar to feed on, aggregating the soil together with fungi as they interact with other clusters of bacteria."
};


buttons.forEach((button) => {
    button.addEventListener('click', () => {
        if (lastClicked) {
            lastClicked.classList.remove('active');
        }
        button.classList.add('active');
        lastClicked = button;

        elementInfo.innerHTML = descriptions[button.id];
        
    });
});


