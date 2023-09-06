const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));


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
        color: "#776a54",
        max_size: 20,       // Biggest size a root can grow to
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

let currentParticleType = 'root';




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





//// NEED TO FIX, NOT SURE IF THIS IS CORRECT WAY OF IMPLEMENTING?
// Implementation of root with random growth direction
elements.root.behavior.push(function(y, x, grid) {

    // Get the number of connected root elements
    let connectedRootCount = dfs(y, x, 'root');

    // Compare with max_size to see if root can still grow
    if (connectedRootCount < elements.root.max_size) {
        let growthDirection = Math.floor(Math.random() * 3) - 1; // Randomly choose -1, 0, or 1 for growth direction

        // Check if there is soil below the root and enough space to grow
        if (grid[y + 1][x] === 'soil') {
            // Adjust growth direction
            if (x + growthDirection >= 0 && x + growthDirection < gridWidth) {
                grid[y + 1][x + growthDirection] = 'root';
            } else {
                grid[y + 1][x] = 'root'; // Grow straight down if no space in the chosen direction
            }
        }
    }
});


//// NEED TO FIX
// DFS helper function to get the number of connected elements
function dfs(y, x, element) {
    if (y < 0 || y >= gridHeight || x < 0 || x >= gridWidth || grid[y][x] !== element) {
        return 0;
    }

    let count = 1;

    // Mark the current cell as visited
    grid[y][x] = 'visited';


    // check all 8 neighbours
    // const neighbors = [
    //     [-1, 0], [1, 0], [0, -1], [0, 1],   // Up, Down, Left, Right
    //     [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonal neighbors
    // ];

    // check only up, down, left, right neighbours
    const neighbors = [
        [-1, 0], [1, 0], [0, -1], [0, 1]   // Up, Down, Left, Right

    ];

    for (const [dy, dx] of neighbors) {
        count += dfs(y + dy, x + dx, element);
    }

    // Reset the current cell to its original element
    grid[y][x] = element;

    return count;
}



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
    }
});



function loop() {
    updateGrid();
    drawGrid();
    requestAnimationFrame(loop);
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