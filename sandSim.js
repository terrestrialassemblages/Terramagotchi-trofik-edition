import RootStructure from './root.js';
import Fungi from './fungi.js';
import Bacteria from './bacteria.js';
import Aggregate from './aggregate.js';


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
                        console.log("Removed oldest instance:", oldestInstanceKey);
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
let processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));

// Fungi and Root related variables
export let currentParticleType = 'rootTip';
export let timeStep = 0;
export let rootIndex = 0;
export let totalRootIndex = 0;
export let fungiIndex = 0;
export let totalFungiIndex = 0;

// Bacteira related variables
let timeMove = 0;
let chosenDirection = null;
let bacteriaIndex = 0;
let totalBacteriaIndex = 29;

export default class RootTip extends RootStructure {
    constructor(startingY, startingX, fungiParent, index) {
        super(startingY, startingX, 10, 500, 'rootTip', 900, index);
        this.parentFungi = new Array();
        this.parentFungi.push(fungiParent);
        console.log(this.parentFungi);
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
            console.log("SUGAR EATEN, INCREASING LENGTH FOR ROOT: ", this.index);
        }
    }
}


export function incrementTotalFungiIndex(incrementedIndex) {
    totalFungiIndex = incrementedIndex;
}

export function decrementTotalFungiIndex(decrementedIndex) {
    totalFungiIndex = decrementedIndex;
}





export const elements = {
    sand: {
        color: "#FFD700",
        behavior: [],
    },
    soil: {
        color: "#452c1b",
        behavior: [],
        soilAlpha: {},
    },
    stone: {
        color: "#211811",
        behavior: [],
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
    darkSoil: {
        color: "#000000",
        behavior: [],
    },
};


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


function generateSoil(y, x, macro = false) {
    let caseNum = Math.floor(Math.random() * 4);

    if (macro == false){
        if (caseNum == 0){

            let aggInstance1 = new Aggregate(y, x+1, null, null);
            let aggInstance2 = new Aggregate(y-1, x+1, null, null);
            let aggInstance3 = new Aggregate(y-1, x, null, null);

            elements.aggregate.aggregateElements[y + "," + (x+1)] = aggInstance1;
            elements.aggregate.aggregateElements[(y-1) + "," + (x+1)] = aggInstance2;
            elements.aggregate.aggregateElements[(y-1) + "," + x] = aggInstance3;

            if(grid[y][x+1] == 'soil'){
                grid[y][x+1] = 'aggregate';  
            }
            if(grid[y-1][x+1] == 'soil'){
                grid[y-1][x+1] = 'aggregate';  
            }
            if(grid[y-1][x] == 'soil'){
                grid[y-1][x] = 'aggregate';  
            }

            return;  
              
        }
        
        else{
            let aggInstance1 = new Aggregate(y, x+1, null, null);
            elements.aggregate.aggregateElements[y + "," + (x+1)] = aggInstance1;
            grid[y][x+1] = 'aggregate';  
            return;  
        }
    }

    

    if (macro == true){
        let aggregateSizeX = Math.floor(Math.random() * 2) + 2;
        let aggregateSizeY = Math.floor(Math.random() * 2) + 1;

        const rotationAngle = Math.random() * Math.PI * 2;


                //const rotationAngle = Math.random() * Math.PI * 2;
                for (let i = 0; i < aggregateSizeX; i++) {
                    for (let j = 0; j < aggregateSizeY; j++) {
                        const aggregateX = x + i;
                        const aggregateY = y - j;
                        // Calculate elliptical values with increased noise
                        const noise = Math.random() * 0.3 - 0.15;
                        let ellipseX = (i - aggregateSizeX / 2 + noise) / (aggregateSizeX / 2);
                        let ellipseY = (j - aggregateSizeY / 2 + noise) / (aggregateSizeY / 2);
                        // Rotate the coordinates
                        const rotatedX = ellipseX * Math.cos(rotationAngle) - ellipseY * Math.sin(rotationAngle);
                        const rotatedY = ellipseX * Math.sin(rotationAngle) + ellipseY * Math.cos(rotationAngle);
                        // Use the elliptical equation to determine if a pixel is inside the ellipse
                        if (rotatedX * rotatedX + rotatedY * rotatedY <= 1) {
                            if (rotatedX * rotatedX + rotatedY * rotatedY <= 1 && grid[aggregateY][aggregateX] == 'soil') {
                                let aggInstance = new Aggregate(aggregateY, aggregateX, null, null);
                                elements.aggregate.aggregateElements[aggregateY + "," + aggregateX] = aggInstance;
                                grid[aggregateY][aggregateX] = 'aggregate';          
                                
                                aggInstance.hasGrow = true;

                            }
                        
                        }
                    }
                }
            }
        
    
    
    
}


/*
function updateSoilcolor(y, x, aggrCount) {
    let aggregateSizeX = Math.floor(Math.random() * 2) + 10;
    let aggregateSizeY = Math.floor(Math.random() * 2) + 10;

    const rotationAngle = Math.random() * Math.PI * 2;

    // Calculate the start and end points to make (y, x) the center
    const startX = x - Math.floor(aggregateSizeX / 2);
    const startY = y - Math.floor(aggregateSizeY / 2);
    const endX = startX + aggregateSizeX;
    const endY = startY + aggregateSizeY;

    for (let aggregateX = startX; aggregateX < endX; aggregateX++) {
        for (let aggregateY = startY; aggregateY < endY; aggregateY++) {
            const i = aggregateX - x;
            const j = aggregateY - y;
            
            // Calculate elliptical values with increased noise
            const noise = Math.random() * 0.3 - 0.15;
            let ellipseX = (i + noise) / (aggregateSizeX / 2);
            let ellipseY = (j + noise) / (aggregateSizeY / 2);
            
            // Rotate the coordinates
            const rotatedX = ellipseX * Math.cos(rotationAngle) - ellipseY * Math.sin(rotationAngle);
            const rotatedY = ellipseX * Math.sin(rotationAngle) + ellipseY * Math.cos(rotationAngle);

            if (rotatedX * rotatedX + rotatedY * rotatedY <= 1) {
                if (grid[aggregateY][aggregateX] === 'soil') {
                    //grid[aggregateY][aggregateX] = 'darkSoil';
                    updateSoilAlpha(aggregateY, aggregateX, aggrCount)
                }
            }
        }
    }
}
*/

function updateSoilAlpha(y, x, aggrCount) {
    if (aggrCount >= 2) {
        let targetAlpha = 1 - (aggrCount - 2) * 0.05;
        targetAlpha = Math.min(Math.max(targetAlpha, 0), 0.8);  // Boundaries between 0 and 0.95

        if (elements.soil.soilAlpha[y + "," + x] > targetAlpha) {
            elements.soil.soilAlpha[y + "," + x] = targetAlpha;
        }
    }
}


function updateInitialAlpha(y, x, height) {
    
        // Normalize height to a 0-70 scale (150-80)
        height = height - 80;

        // Scale alpha so it's smaller when height is smaller
        let targetAlpha = 0.7 + height * (1 - 0.7) / 40;

        // Set boundaries between 0.8 and 1
        targetAlpha = Math.min(Math.max(targetAlpha, 0.7), 1); 

        if (elements.soil.soilAlpha[y + "," + x] > targetAlpha) {
            elements.soil.soilAlpha[y + "," + x] = targetAlpha;
        }
    
}





elements.aggregate.behavior.push(function(y, x, grid) {
    let currAggr = findAggregateByPosition(elements.aggregate.aggregateElements, x, y);

    if (grid[y][x] === 'aggregate') {
        const [isNear, aggrCount, hasMoreAggre] = currAggr.ifNearOtherAgg(5, grid);

        //const num = currAggr.getAggregateCount(y, x, grid);

        //console.log("aggregate number: ", aggrCount)
        //updateSoilAlpha(y, x, aggrCount)

        if (aggrCount >= 2 && hasMoreAggre){
            updateSoilcolor(y, x, aggrCount)
        }

        //console.log("result", result)
        if (isNear){
            if (!currAggr.hasGrow){
                generateSoil(y, x, isNear);
                currAggr.hasGrow = true;
            }
        }
    }

});


export function findBacteriaByPosition(bacteriaElements, x, y) {
    for (let bacteria of bacteriaElements) {
        if (bacteria.x === x && bacteria.y === y) {
            return bacteria;
        }
    }
    return null;  // Return null if no matching bacteria is found
}



elements.bacteria.behavior.push(function (y, x, grid) {
    let currentBac = findBacteriaByPosition(elements.bacteria.bacteriaElements, x, y)

    // if bacteria is fading, dont move
    if (currentBac.fading) {      
        return;
    }

    let DISDANCE = 40;
    const result = currentBac.IfNearLiquidSugar(DISDANCE, grid);

    let Agregate = currentBac.IfNearBacteria(5, grid, 2)
    //console.log("agr", Agregate)
    
    if (Agregate){
        generateSoil(y, x);
    }
    
    

    let ifNear = result.ifNear;
    let priorityDirection = result.priorityDirection;
    //console.log(priorityDirection);

    if (ifNear) {
        //console.log(timeMove % elements.bacteria.frameTimer);
        if (timeMove % elements.bacteria.frameTimer == 0) {

            chosenDirection = priorityDirection;

            //console.log(chosenDirection);
            let random = Math.floor(Math.random() * 4);
            if (random == 0){
                chosenDirection = currentBac.choseDirection();
            }
            

            

            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            if (grid[newY][newX] === 'liquidSugar') {
                grid[newY][newX] = 'bacteria';
                elements.bacteria.bacteriaElements.push(new Bacteria("#800080", 15, null, 0, [], newX, newY, 400000))
            } else {
                currentBac.bacteriaMovement(newY, newX, grid, processed);
            }
            
        }
        
    }
    else {
        //console.log(timeMove % elements.bacteria.frameTimer);
        if (timeMove % elements.bacteria.frameTimer == 0) {

            //directionTimer smaller change direction more frequentlly
            if (elements.bacteria.directionTimer % 5 !== 0) {
                chosenDirection = currentBac.choseDirection();
            }
            else {
                if (currentBac.currentDirection !== null) {
                    chosenDirection = currentBac.currentDirection;
                    // If the bacteria is touching any boundary, choose a new direction
                    if (y == 0 || y == gridHeight - 1 || x == 0 || x == gridWidth - 1) {
                        chosenDirection = currentBac.choseDirection();
                    }
                }
                else {
                    chosenDirection = currentBac.choseDirection();
                }
            }
            elements.bacteria.directionTimer++;
            //console.log(chosenDirection);



            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            currentBac.bacteriaMovement(newY, newX, grid, processed);

        }
    }
});


elements.sand.behavior.push(function (y, x, grid) {
    // Sand behavior logic goes here, based on the extracted updateGrid function
    if (grid[y + 1][x] === null) {
        // Move sand down
        grid[y + 1][x] = 'sand';
        grid[y][x] = null;
    } else if (grid[y + 1][x] === 'water') {
        // If there's water below the sand, swap the two
        grid[y + 1][x] = 'sand';
        grid[y][x] = 'water';
    }
    // ... rest of the sand behavior ...
});


elements.soil.behavior.push(function (y, x, grid) {
    if (grid[y + 1][x] === null) {
        // If the bottom is empty, let the dirt move downward
        grid[y + 1][x] = 'soil';
        grid[y][x] = null;
    } else {
        // If the bottom is not empty, try to let the dirt slide to the sides
        let leftX = x - 1;
        let rightX = x + 1;
        if (leftX >= 0 && rightX < gridWidth) {
            let leftHeight = 0;
            let rightHeight = 0;
            // Calculate the height of the left and right sides
            while (leftX >= 0 && grid[y + 1][leftX] === null) {
                leftHeight++;
                leftX--;
            }
            while (rightX < gridWidth && grid[y + 1][rightX] === null) {
                rightHeight++;
                rightX++;
            }
            // If the height of the left side is greater than or equal to 3 or the height of the right side is greater than or equal to 3, let the clods slide in both directions
            if (leftHeight >= 3 || rightHeight >= 3) {
                if (leftHeight >= rightHeight) {
                    grid[y + 1][x - leftHeight] = 'soil';
                    grid[y][x] = null;
                } else {
                    grid[y + 1][x + rightHeight] = 'soil';
                    grid[y][x] = null;
                }
            }
        }
    }
});


// The body of the root
elements.root.behavior.push(function (y, x, grid) {
    // If no block below, remove root
    if (grid[y + 1][x] === null) {
        grid[y][x] = null;
    }
});


// This is the ends of the roots
elements.rootTip.behavior.push(function (y, x, grid) {
    try{

        

        // Update for every RootTip instance in the grid array
        if (totalRootIndex > 0) {

            // Get the current rootTip object
            let curr = elements[grid[y][x]].rootElements[rootIndex];

            // Check if sugar produced has been eaten
            curr.sugarEaten()

            // Ckeck if root can grow
            let result = curr.growBool(totalRootIndex);

            // Update totalRootIndex
            totalRootIndex = result[1];

            // If it can grow, expand root
            if (result[0]) {
                totalRootIndex = curr.expandRoot(elements.rootTip.rootElements, rootIndex, totalRootIndex);
            }
            rootIndex++;

            // Reset index once we finish iterating through all the rootTips
            if (rootIndex >= totalRootIndex) {
                rootIndex = 0;
            }
        }
    }catch (error) {
        // If an error occurs, log it and return from the function
        console.error('An error occurred:', error.message);
        return;
    }

});


elements.fungi.behavior.push(function (y, x, grid) {
    if (totalFungiIndex > 0) {
        try{
            let curr = elements[grid[y][x]].fungiElements[fungiIndex];
        // If root is not at max size, expand root
        let result = curr.growBool(totalFungiIndex);
        totalFungiIndex = result[1];
        if (result[0]) {
            //console.log("TIME TO GROW");
            // Branch out to the root tip and attach to it
            if (curr.branchingToRoot == true && curr.attached == false) {
                if (curr.nearestRootFound == false) {
                    // Find the closest root tip at that moment
                    curr.findRootTip();
                }
                else {
                    // Expand to root tip
                    curr.expandFungiToRoot();
                }
            }
            else {
                // Every other fungi root that will normally grow
                curr.expandRoot(elements.fungi.fungiElements, fungiIndex, totalFungiIndex);
            }
        }
        fungiIndex++;

        if (fungiIndex >= totalFungiIndex) {
            fungiIndex = 0;
        }   
        }catch (error) {
            // If an error occurs, log it and return from the function
            console.error('An error occurred:', error.message);
            return;
        }
        
    }

    

});


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

function generateBacterial() {
    //grid[129][20] = 'bacteria';

    for (let i = 0; i < 50; i++) {
        /*
        let i = 10; // Example start of range
        let j = 50; // Example end of range

        let randomNumber = Math.floor(Math.random() * (j - i + 1)) + i;
        console.log(randomNumber);*/

        const randomX = Math.floor(Math.random() * (200 - 0 + 1)) + 0;
        const randomY = Math.floor(Math.random() * (120 - 80 + 1)) + 80;
        if (grid[randomY][randomX]== 'soil') {
            grid[randomY][randomX] = 'bacteria';
            //grid[randomY+1][randomX+1] = 'bacteria';
        }


        elements.bacteria.bacteriaElements.push(new Bacteria("#800080", 15, null, 0, [], randomX, randomY, 400000))
        //elements.bacteria.bacteriaElements.push(new Bacteria("#800080", 15, null, 0, [], randomX+1, randomY+1, 4000))

        //currBacteria.updatePosition(newY, newX);


        //bacteriaIndex++;

    }
}

/*
function testing(){
    //elements.aggregate.bacteriaElements.push(new Agregate(0, 0))
    grid[20][20] = 'aggregate'
    grid[21][20] = 'fungi'
    
    generateSoil(20, 20, ifNearOtherAgg(grid, 20, 20))
    

    grid[23][20] = 'aggregate'

    grid[140][20] = 'aggregate'
    grid[23][21] = 'fungi'
}
*/

export function findAggregateByPosition(aggregateElements, x, y) {

    if (aggregateElements[y + "," + x] !== undefined) {
        return aggregateElements[y + "," + x];
    }
      
    return null;  // Return null if no matching bacteria is found
}



function calculateSoilColor(color1, color2, alpha) {

    if (!color1 || !color2) {
        return "#452c1b";
    }

    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * alpha);
    const g = Math.round(g1 + (g2 - g1) * alpha);
    const b = Math.round(b1 + (b2 - b1) * alpha);

    let resultColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    //console.log("color:", resultColor);
    return resultColor;
}




function updateSoilcolor(y, x, aggrCount, init = false) {
    let adjustSize = Math.floor(Math.random() * 10);
    let aggregateSizeX = Math.floor(Math.random() * 2) + adjustSize;
    let aggregateSizeY = Math.floor(Math.random() * 2) + adjustSize;

    if(init == true){
        aggregateSizeX = Math.floor(Math.random() * 2) + 20;
        aggregateSizeY = Math.floor(Math.random() * 2) + 20;
    }

    const rotationAngle = Math.random() * Math.PI * 2;

    // Calculate the start and end points to make (y, x) the center
    const startX = x - Math.floor(aggregateSizeX / 2);
    const startY = y - Math.floor(aggregateSizeY / 2);
    const endX = startX + aggregateSizeX;
    const endY = startY + aggregateSizeY;

    for (let aggregateX = startX; aggregateX < endX; aggregateX++) {
        for (let aggregateY = startY; aggregateY < endY; aggregateY++) {
            const i = aggregateX - x;
            const j = aggregateY - y;
            
            // Calculate elliptical values with increased noise
            const noise = Math.random() * 0.3 - 0.15;
            let ellipseX = (i + noise) / (aggregateSizeX / 2);
            let ellipseY = (j + noise) / (aggregateSizeY / 2);
            
            // Rotate the coordinates
            const rotatedX = ellipseX * Math.cos(rotationAngle) - ellipseY * Math.sin(rotationAngle);
            const rotatedY = ellipseX * Math.sin(rotationAngle) + ellipseY * Math.cos(rotationAngle);

            const distanceFromCenter = rotatedX * rotatedX + rotatedY * rotatedY;
            const inEllipse = distanceFromCenter <= 1;

            // Use a smoother function for the drawing probability
            const probability = Math.random();
            const threshold = 1 - Math.pow(distanceFromCenter, 0.5);

            if (inEllipse && probability < threshold) {
                if (grid[aggregateY][aggregateX] === 'soil' && init == true){
                    updateInitialAlpha(aggregateY, aggregateX, aggregateY);
                }
                if (grid[aggregateY][aggregateX] === 'soil'&& init == false) {
                    //grid[aggregateY][aggregateX] = 'darkSoil';
                    updateSoilAlpha(aggregateY, aggregateX, aggrCount)
                }
            }
        }
    }
}


function initSoilGradient(){
    for (let i = 80; i < 120; i+=10) {
        for (let j = 0; j < 200; j+=5) {
            updateSoilcolor(i,j,0,true);
        }

    }

}



