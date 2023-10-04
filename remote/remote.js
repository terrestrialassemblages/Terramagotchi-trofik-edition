import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://terramagotchi-trofik-edition-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

// Initialize Firebase
const app = initializeApp(appSettings);
const database = getDatabase(app);

// Get current instance ID
const INSTANCE_ID = (new URL(document.location)).searchParams.get("id");
document.getElementById('instanceID').innerHTML = "Instance: " + INSTANCE_ID;

// Get DB for current instance
const instanceDB = ref(database, 'instances/' + INSTANCE_ID);

// Add user action to current intance table in DB for each of the corresponding element buttons
// Each entry will have: element, instanceID, currtime
const particle_button_click = (type) => {
    const value = { 
        element : type, 
        instanceID : INSTANCE_ID, 
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