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
        color: "#4d4436",
        max_size: 30,       // Biggest size a root can grow to
        behavior: [],
    },
    rootTip: {
        color: "#6b5e4a",
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
elements.root.behavior.push(function(y, x, grid) {
    // If no block below, remove root
    if (grid[y + 1][x] === null) {
        grid[y][x] = null;
    }
});


// This is the ends of the roots
elements.rootTip.behavior.push(function(y, x, grid) {
    // Every update, either expand roots or produce liquid sugar //////////////////

    //If expanding roots //////////////////////////////////////////////////////////
    // Count the number of roots connected to this rootTip
    const rootCount = countRoots(y, x, grid);
    console.log(rootCount);

    // If root is not at max size, expand root
    if (rootCount < elements.root.max_size) {
        expandRoot(y, x);
    }
    ///////////////////////////////////////////////////////////////////////////////


    //If producing liquid sugar ///////////////////////////////////////////////////
    // CODE HERE 
    ///////////////////////////////////////////////////////////////////////////////

});

// Fuction to grow root by one grid cell
function expandRoot(y, x) {
    
    // Randomly choose -1, 0, or 1 for x growth direction (either grow left-down, down, right-down)
    let x_direction = Math.floor(Math.random() * 3) - 1; 

    // Set the probability to branch into 2 roots
    let shouldBranch = Math.random() < 0.1; 

    // If shouldBranch is true, and there is enough space to grow, grow 2 roots in opposite directions (enough space means the grid it is growing onto + both adjacent grids to that are soil)
    if (grid[y + 1][x - 1] === 'soil' && grid[y + 1][x - 2] === 'soil' && grid[y + 1][x] === 'soil' &&
    grid[y + 1][x + 1] === 'soil' && grid[y + 1][x + 2] === 'soil' && shouldBranch) {
        grid[y + 1][x - 1] = 'rootTip';
        grid[y + 1][x + 1] = 'rootTip';
        grid[y][x] = 'root';

    // Not branching but there is enough space to grow, grow in that direction
    } else if (grid[y + 1][x + x_direction] === 'soil' && grid[y + 1][x + x_direction + 1] === 'soil' && grid[y + 1][x + x_direction - 1] === 'soil') { 
        grid[y + 1][x + x_direction] = 'rootTip';
        grid[y][x] = 'root';

    // If no block is below the root, remove root
    } else if (grid[y + 1][x] === null) {
        grid[y][x] = null;
    }
}


// Function to count the number of roots connected to a rootTip
function countRoots(y, x, grid) {
    let rootCount = 0;
    // Create a visited array to keep track of which cells have been visited
    const visited = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));

    // Define all 8 possible neighbours
    const neighbours = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    // Recursive dfs function to count the number of connected roots
    function dfs(row, col) {
        // Check if cell is out of bounds or has been visited, if so, exit
        if (row < 0 || row >= gridHeight || col < 0 || col >= gridWidth || visited[row][col]) {
            return;
        }
        visited[row][col] = true;
        if (grid[row][col] === 'rootTip' || grid[row][col] === 'root') {
            rootCount++;
            // Explore all neighbouring cells, halt if count is the max root size
            if (rootCount < elements.root.max_size) {
                for (const [dx, dy] of neighbours) {
                    dfs(row + dy, col + dx);
                }
            }
        }
    }
    dfs(y, x);
    return rootCount;
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

    // ADJUSTED FPS TO 10 SO TIME PROGRESSES SLOWER IN BROWSER
    requestAnimationFrame(function() {
        setTimeout(loop, 100); // Delay for 100 milliseconds (10 FPS)
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

    // grow some roots
    grid[79][25] = 'rootTip';
    grid[79][75] = 'rootTip';
    grid[79][90] = 'rootTip';
    grid[79][160] = 'rootTip';
    grid[79][165] = 'rootTip';


    // Call any other functions required to render the grid on the canvas.
}