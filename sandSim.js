const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));

// Test class for Roots
class RootTip {
    constructor(startingY, startingX, index) {
        this.startingY = startingY;
        this.startingX = startingX;
        // Reference it in the list of roots
        this.index = index;
        // Every growthSpeed number of time steps, it will grow (Higher growthSpeed means it grows slower)
        this.growthSpeed = 100;
        this.maxGrowthLength = 40;
        this.length = 1;
    }

    // Determines if root should grow or not
    growBool() {
        return ((timeStep % this.growthSpeed == 0) && (this.length < this.maxGrowthLength));
    }

    // Adjusts the growth speed depending on the current length
    updateGrowthSpeed(y, x) {
        // Pythagoras from starting location
        let distance = Math.sqrt(Math.pow(Math.abs(y - this.startingY), 2) + (Math.pow(Math.abs(x - this.startingX), 2)));
        this.growthSpeed = 1 + Math.ceil(distance / this.maxGrowthLength) * 100;
        console.log("GROWTH SPEED", this.growthSpeed);
    }

    // Checks if neighboring cells are soil
    canGrow(y, x) {
        if (grid[y][x - 1] === 'soil' &&
            grid[y][x + 1] === 'soil' &&
            grid[y + 1][x] === 'soil' &&
            grid[y + 1][x - 1] === 'soil' &&
            grid[y + 1][x + 1] === 'soil') {
            return true;
        }
        return false;
    }

    // Fuction to grow root by one grid cell
    expandRoot(y, x) {

        // Randomly choose -1, 0, or 1 for x growth direction (either grow left-down, down, right-down)
        let x_direction = Math.floor(Math.random() * 3) - 1;

        // Set the probability to branch into 2 roots
        let shouldBranch = Math.random() < 0.2;

        // If shouldBranch is true, and there is enough space to grow, grow 2 roots diagonally down in opposite directions (enough space means the grid it is growing onto + both adjacent grids to that are soil)
        if (grid[y + 1][x - 1] === 'soil' && this.canGrow(y + 1, x - 1) &&
            grid[y + 1][x + 1] === 'soil' && this.canGrow(y + 1, x + 1) && shouldBranch) {
            grid[y + 1][x - 1] = 'rootTip';


            // Need to create a new rootTip object


            grid[y + 1][x + 1] = 'rootTip';
            grid[y][x] = 'root';
            // Update length
            this.length += 1 + x_direction;

            // Not branching but there is enough space to grow, grow in that direction
        } else if (grid[y + 1][x + x_direction] === 'soil' && this.canGrow(y + 1, x + x_direction)) {
            // Update length
            this.length += 1 + x_direction;
            grid[y + 1][x + x_direction] = 'rootTip';
            grid[y][x] = 'root';

            // If no block is below the root, remove root
        } else if (grid[y + 1][x] === null) {
            grid[y][x] = null;
        }
        console.log("GROWING", rootIndex);
        this.updateGrowthSpeed(y, x);
        console.log("UPDATED GROWTH SPEED");
    }

}

const elements = {
    sand: {
        color: "#FFD700",   
        //density: 0.7, gravity: 0.8, slip: 0, slide: 0.8, scatter: 0,
        behavior: [],
    },

////placeholder implementation of soil, needed to simulate plant roots
    soil: {
        color: "brown",   
        behavior: [],
    },

    root: {
        color: "#4d4436",
        max_size: 30,       // Biggest size a root can grow to
        behavior: [],
    },
    rootTip: {
        color: "#6b5e4a",
        behavior: [],
    },

    rootTip: {
        color: "#6b5e4a",
        rootElements: [],
        behavior: [],
    },

    fungi: {
        colour: "white",
        behaviour: [],
    },
};

let elementId = 0;
for(const elementName in elements){
    elements[elementName].id = elementId++;
}

let currentParticleType = 'rootTip';
let timeStep = 0;
let rootIndex = 0;
let totalRootIndex = 0;


elements.sand.behavior.push(function(y, x, grid) {
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

//// Placeholder implementation of soil
elements.soil.behavior.push(function(y, x, grid) {
    // Soil behavior logic goes here, based on the extracted updateGrid function
    if (grid[y + 1][x] === null) {
        grid[y + 1][x] = 'soil';
        grid[y][x] = null;
    } else if (grid[y + 1][x] === 'water') {
        grid[y + 1][x] = 'soil';
        grid[y][x] = 'water';
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
    curr = elements[grid[y][x]].rootElements[rootIndex];
    // Every update, either expand roots or produce liquid sugar //////////////////

    //If expanding roots //////////////////////////////////////////////////////////
    // Count the number of roots connected to this rootTip
    // If root is not at max size, expand root
    if (curr.growBool()) {
        curr.expandRoot(y, x);
    }
    rootIndex++;
    if (rootIndex == totalRootIndex) {
        rootIndex = 0;
    }
    ///////////////////////////////////////////////////////////////////////////////


    //If producing liquid sugar ///////////////////////////////////////////////////
    // CODE HERE 
    ///////////////////////////////////////////////////////////////////////////////

});


// // Implementation of root growing straight downwards
// elements.root.behavior.push(function(y, x, grid) {
//     let connectedRootCount = dfs(y, x,'root');

//     // Check if root can still grow
//     if (connectedRootCount < elements.root.max_size) {

//         // If there is soil below the root and enough space to grow, grow
//         if (grid[y + 1][x] === 'soil') {
//             grid[y + 1][x] = 'root';

//         // No soil below root, root cannot grow
//         } else if (grid[y + 1][x] === null) {
//             alert("Cannot place roots here");
//             grid[y][x] = null;
//         }
//     }
// });


function updateGrid() {
    for (let y = gridHeight - 2; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            let element = grid[y][x];
            if (element && elements[element] && Array.isArray(elements[element].behavior)) {
                for (let func of elements[element].behavior) {
                    func(y, x, grid);
                }
            }
        }
    }
}
            
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] in elements){
                ctx.fillStyle = elements[grid[y][x]].color; 
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

}


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
        console.log("PLACING");
        console.log(currentParticleType);
        if (currentParticleType == 'rootTip') {
            console.log("PLACING ROOT Tip");
            elements[currentParticleType].rootElements.push(new RootTip(y, x, totalRootIndex++));
        }
    }
});




function loop() {
    updateGrid();
    drawGrid();
    requestAnimationFrame(loop);
    timeStep++;
    console.log(timeStep);
    // ADJUSTED FPS TO 10 SO TIME PROGRESSES SLOWER IN BROWSER
    requestAnimationFrame(function() {
        setTimeout(loop, 50); // Delay for 100 milliseconds (10 FPS)
    });
}

window.addEventListener('load', function() {
    // Logic to draw sand on the canvas automatically
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    loop();
    drawSandAutomatically();
});

function drawSandAutomatically() {
    // Logic to draw sand on the canvas
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    // For example:
    
    
    // fill background up with soil
    for (let i = 80; i < 150; i++) {
        for (let j = 0; j < 200; j++) {
            grid[i][j] = 'soil';
        }
        
    }

    // Call any other functions required to render the grid on the canvas.
}