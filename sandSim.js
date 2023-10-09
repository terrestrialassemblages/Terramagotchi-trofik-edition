import RootStructure from './root/root.js';
import Fungi from './fungi/fungi.js';
//import {calculateSoilColor} from './aggregate_behavior.js';
import { updateSoilcolor, updateSoilAlpha, updateInitialAlpha, initSoilGradient, calculateSoilColor} from './aggregate/aggregate_behavior.js';
import {waterBehavior} from './water_behavior.js';
import {soilBehavior} from './soil_behavior.js';
import {rootBehavior} from './root/root_behavior.js';
import {rootTipBehavior} from './root/roottip_behavior.js';
import {sunShow, drawSun, generateRain} from './weather.js';
import { findBacteriaByPosition, generateBacterial, bacteriaBehavior} from './bacteria/bacteria_behavior.js';
import {fungiBehavior} from './fungi/fungi_behavior.js';



//testing


// CANT GET NPM PACKAGES WORKING
// import cryptoRandomString from 'crypto-random-string';
// import toCanvas from 'qrcode';

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set, onChildAdded, remove, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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

// Generate random instance ID every time the page is loaded
const INSTANCE_ID = Math.floor(Math.random() * 1000000000);

// Function to connect to the database
function connectToDB() {
    // Initialize firebase
    initializeApp(FIREBASE_CONFIG);
    const database = getDatabase();
    const auth = getAuth();
    
    // Authenticate user anonymously
    signInAnonymously(auth)
    .then((userCredential) => {
        // Anonymous user sign in
        const user = userCredential.user;
        console.log("Anonymous user ID:", user.uid);

        // Create table for current instance
        const instanceDB = ref(database, 'instances/' + INSTANCE_ID);
        const initialData = {
            startup : {
                element : null, 
                instanceID : INSTANCE_ID, 
                currtime : Date.now()
            }
        }
        set(instanceDB, initialData)
        .then(() => {
            console.log("CREATED DB: ", INSTANCE_ID);
        })

        // Create QR code for remote app
        createQR();

        // Remove older instances in the DB, if there are more than specified
        removeOldInstances(database, 5);

        // DB listener, runs when a new user action is detected
        onChildAdded(instanceDB, (snapshot) => {
            const newData = snapshot.val();
            if (newData.element != null) {
                console.log("New element added:", newData.element);
    
                // RUN CODE TO ADD ELEMENT TO GRID HERE
                addToCanvas(newData.element);

                // THEN REMOVE THE ENTRY FROM THE DB (MAYBE WE DONT NEED?)
                //console.log("REMOVING ENTRY key:", snapshot.key);

            }
        });
    })
    .catch((error) => {
        // Handle errors
        console.error("Error signing in anonymously:", error);
    });
}

// Function to remove instances from the database if the total number of instances exceeds the limit
function removeOldInstances(database, limit = 50) {
    const instancesRef = ref(database, 'instances');
    get(instancesRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const instances = snapshot.val();
            const instanceKeys = Object.keys(instances);
            if (instanceKeys.length > limit) {
                // Sort instance keys by timestamp in ascending order
                instanceKeys.sort((a, b) => instances[a].startup.currtime - instances[b].startup.currtime);

                // Determine the number of instances to remove
                const instancesToRemove = instanceKeys.length - limit;

                // Remove the oldest instances
                for (let i = 0; i < instancesToRemove; i++) {
                    const oldestInstanceKey = instanceKeys[i];
                    const oldestInstanceDB = ref(database, 'instances/' + oldestInstanceKey);
                    remove(oldestInstanceDB)
                    .then(() => {
                        //console.log("Removed oldest instance:", oldestInstanceKey);
                    })
                    .catch((error) => {
                        console.error("Error removing instance:", oldestInstanceKey, error);
                    });
                }
            }
        }
    })
    .catch((error) => {
        console.error("Error removing instances, could not get snapshot of the table", error);
    });
}


//version with QR code onplay
/*
function createQR() {
    //const qr_code_canvas = document.getElementById("qr-code");
    const remote_url = document.location.origin + "/remote/?id=" + INSTANCE_ID;

    // CURRENT VERSION GENERATES TEXT LINK INSTEAD OF QR CODE
    const remote_url_link = document.createElement("a");
    remote_url_link.href = remote_url;
    remote_url_link.textContent = remote_url;


    document.getElementById("remote-url").textContent = '';
    document.getElementById("remote-url").appendChild(remote_url_link);


    createQRCode(remote_url);
}




function createQRCode(remote_url) {
    // Create an HTML element to hold the QR code
    const qrCodeElement = document.createElement('div');
    
    // Initialize the QR code generator
    new QRCode(qrCodeElement, {
        text: remote_url,
        width: 128,
        height: 128
    });

    // Clear existing content in the container and append the new QR code element
    const container = document.getElementById('remote-url');
    container.textContent = '';
    container.appendChild(qrCodeElement);
}
*/




function createQR() {
    const remote_url = document.location.origin + "/remote/?id=" + INSTANCE_ID;

    // Create a text link
    const remote_url_link = document.createElement("a");
    remote_url_link.href = remote_url;
    remote_url_link.textContent = remote_url;

    const container = document.getElementById("remote-url");

    // Clear existing content
    container.textContent = '';

    // Append the link
    container.appendChild(remote_url_link);

    // Create and append the QR code
    createQRCode(remote_url);
}

function createQRCode(remote_url) {
    // Create an HTML element to hold the QR code
    const qrCodeElement = document.createElement('div');
    
    // Initialize the QR code generator
    new QRCode(qrCodeElement, {
        text: remote_url,
        width: 128,
        height: 128
    });

    // Append the new QR code element to the existing container
    const container = document.getElementById('remote-url');
    container.appendChild(qrCodeElement);
}







// Initialize canvas
const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

export let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));
export let processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));

// Fungi and Root related variables
export let currentParticleType = 'rootTip';
export let timeStep = 0;
export let rootIndex = 0;
export let totalRootIndex = 0;
export let fungiIndex = 0;
export let totalFungiIndex = 0;

// Bacteira related variables
export let timeMove = 0;
export let chosenDirection = null;

export default class RootTip extends RootStructure {
    constructor(startingY, startingX, fungiParent, index) {
        super(startingY, startingX, 10, 500, 'rootTip', 900, index);
        this.parentFungi = new Array();
        this.parentFungi.push(fungiParent);
        //console.log(this.parentFungi);
    }

    // Function to produce 1 block of liquid sugar from root tip
    produceSugar() {
        if (grid[this.y][this.x] == 'rootTip') {

            // If the block below is soil or fungi, produce liquid sugar
            if (grid[this.y + 1][this.x] === 'soil' || grid[this.y + 1][this.x] === 'fungi') {
                grid[this.y + 1][this.x] = 'liquidSugar';
            }
        }
    }

    // Function to check if liquid sugar has been eaten. If yes, allows root to grow larger
    sugarEaten() {

        if (this.developed == true && grid[this.y + 1][this.x] == 'bacteria') {
            // Increase max length of rootTip
            this.developed = false;
            this.maxGrowthLength += 2;
            for (let i = 0; i < this.parentFungi.length; i++) {
                this.parentFungi[i].expandRoot(elements.fungi.fungiElements, fungiIndex, totalFungiIndex);
            }
            // this.growthSpeed = Math.round(this.growthSpeed * (2 / 3));
            //console.log("SUGAR EATEN, INCREASING LENGTH FOR ROOT: ", this.index);
        }
    }
}


export function incrementTotalFungiIndex(incrementedIndex) {
    totalFungiIndex = incrementedIndex;
}

export function decrementTotalFungiIndex(decrementedIndex) {
    totalFungiIndex = decrementedIndex;
}

export function changeChosenDirection(newDirection) {
    chosenDirection = newDirection;
}

export function IncementFungiIndex(newIndex) {
    fungiIndex = newIndex;
}

export function resetFungiIndex() {
    fungiIndex = 0;
}

export function incrementTotalRootIndex(incrementedIndex) {
    totalRootIndex = incrementedIndex;
}

export function IncementRootIndex(newIndex) {
    rootIndex = newIndex;
}

export function resetRootIndex() {
    rootIndex = 0;
}



export const elements = {
    soil: {
        color: "#452c1b",
        behavior: [],
        soilAlpha: {},
    },
    water: {
        color: "#5756c2",
        behavior: [],
    },
    root: {
        color: "#706f6e",
        max_size: 30,       // Biggest size a root can grow to
        behavior: [],
    },
    rootTip: {
        color: "#6b5e4a",
        rootElements: [],
        behavior: [],
    },

    fungi: {
        color: "#b5b5b5",
        fungiElements: [],
        behavior: [],
    },
    liquidSugar: {
        color: "#FFB700",
        behavior: [],
    },
    bacteria: {
        color: "#800080", frameTimer: 15, directionTimer: 20,
        bacteriaElements: [],
        behavior: [],
    },
    aggregate: {
        color: '#593e2b',
        //color: '#000000',
        aggregateElements: {},
        behavior: [],
    },
};

elements.water.behavior.push((y, x, grid) => waterBehavior(y, x, grid, gridHeight));
elements.fungi.behavior.push((y, x, grid) => fungiBehavior(y, x, grid));
elements.root.behavior.push((y, x, grid) => rootBehavior(y, x, grid));
elements.soil.behavior.push((y, x, grid) => soilBehavior(y, x, grid));
elements.rootTip.behavior.push((y, x, grid) => rootTipBehavior(y, x, grid, gridHeight));

// Function for adding user actions to the canvas
function addToCanvas(element) {
    // element is dropped from the top of the canvas at a random x position
    const x = Math.floor(Math.random() * (gridWidth - 0 + 1)) + 0;
    const y = 10;

    if (element == 'water') {
        grid[y][x] = 'water';

    } else if (element == 'chemical') {
        grid[y][x] = 'chemical';

    } else {
        // CODE FOR ADD SUN HERE
    }
}



elements.bacteria.behavior.push((y, x, grid) => bacteriaBehavior(y, x, grid));







elements.liquidSugar.behavior.push(function (y, x, grid) {
    // If no block below, remove
    if (grid[y + 1][x] === null) {
        grid[y][x] = null;
    }
});




function updateGrid() {
    processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));

    for (let y = gridHeight - 2; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            let element = grid[y][x];
            let IsProcessed = processed[y][x];
            if (!IsProcessed) {
                if (element && elements[element] && Array.isArray(elements[element].behavior)) {
                    for (let func of elements[element].behavior) {
                        func(y, x, grid);
                    }
                }
            }
        }
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSun(ctx, canvas, 7);

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] in elements) {
                if (grid[y][x] === 'bacteria') {
                    // Draw bacteria with the adjusted alpha value
                    ctx.fillStyle = elements.bacteria.color;
                    ctx.globalAlpha = elements.bacteria.bacteriaElements.find(bacteria => bacteria.x === x && bacteria.y === y)?.fadeAlpha || 1.0;
                } else {
                    ctx.fillStyle = elements[grid[y][x]].color; // Set color based on element type
                    ctx.globalAlpha = 1.0; // Reset alpha for other elements
                }
                if (grid[y][x] === 'soil') {
                    let soilColor = calculateSoilColor('#26170d',elements.soil.color, elements.soil.soilAlpha[y + "," + x]);
                    ctx.fillStyle = soilColor;
                }
                
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    ctx.globalAlpha = 1.0;
}


canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    // Add 'aggregate' to the grid at the clicked location
    
    /*
    grid[y][x] = 'aggregate';
    let aggInstance = new Aggregate(y, x, null, null);
    elements.aggregate.aggregateElements[y + "," + x] = aggInstance;
    */
   testing(y, x)
    
    //add liquidSugar
    //grid[y][x] = 'liquidSugar';
});



/*
// User actions
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    if (event.button === 1) {
        // Cycle to the next element with middle mouse button
        //// ERROR WITH FLOATING SOIL IF YOU CYCLE ELEMENTS TOO MUCH
        const elementNames = Object.keys(elements);
        const currentIndex = elementNames.indexOf(currentParticleType);
        const nextIndex = (currentIndex + 1) % elementNames.length;
        currentParticleType = elementNames[nextIndex];
    } else {
        // Place the current element on the grid with Mouse1
        grid[y][x] = currentParticleType;
        //console.log(currentParticleType);
        if (currentParticleType == 'rootTip') {
            elements[currentParticleType].rootElements.push(new RootTip(y, x, totalRootIndex++));
        }
        else if (currentParticleType == 'fungi') {
            elements[currentParticleType].fungiElements.push(new Fungi(y, x, true, totalFungiIndex++));
        }
    }
});
*/

function loop() {
    updateGrid();
    drawGrid();
    requestAnimationFrame(loop);

    generateRain(grid, gridWidth);
    //testing()
    
    timeStep++;
    timeMove++;

    elements.bacteria.bacteriaElements.forEach((bacteria, index) => {
        bacteria.decreaseLifespan();
        if (bacteria.lifespan <= 0) {
            // Bacteria dies out
            bacteria.fade(ctx, elements, cellSize, grid, index);            
        }
    });

    elements.bacteria.bacteriaElements.forEach((bacteria, index) => {
        if(grid[bacteria.y][bacteria.x]!= "bacteria"){
            elements.bacteria.bacteriaElements.splice(index, 1);
        }
        //console.log(elements.bacteria.bacteriaElements);
        
    });
}

window.addEventListener('load', function () {
    // Logic to draw sand on the canvas automatically
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    loop();
    
    drawAutomatically();
    //generateSoil();
    generateBacterial();
    initSoilGradient();

    connectToDB();
});

function drawAutomatically() {
    // Logic to preload elements onto the grid

    // fill background up with soil
    for (let i = 80; i < 150; i++) {
        for (let j = 0; j < 200; j++) {
            grid[i][j] = 'soil';
            elements.soil.soilAlpha[i + "," + j] = 1;
        }

    }

    // Grow some roots and fungi

    // 80 25
    let fungiObj = new Fungi(81, 25, false, totalFungiIndex++);
    grid[81][25] = 'fungi';
    elements.fungi.fungiElements.push(fungiObj);
    let rootObj = new RootTip(80, 25, fungiObj, totalRootIndex++);
    grid[80][25] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;


    // 80 75
    grid[81][75] = 'fungi';
    fungiObj = new Fungi(81, 75, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(fungiObj);
    rootObj = new RootTip(80, 75, fungiObj, totalRootIndex++);
    grid[80][75] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;




    // 81 140
    grid[81][140] = 'fungi';
    fungiObj = new Fungi(81, 140, false, totalFungiIndex++)
    elements.fungi.fungiElements.push(fungiObj);
    rootObj = new RootTip(80, 140, fungiObj, totalRootIndex++);
    grid[80][140] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;


    // Call any other functions required to render the grid on the canvas.
}




