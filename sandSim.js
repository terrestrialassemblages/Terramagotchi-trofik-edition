const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));

let currentParticleType = 'rootTip';
let timeStep = 0;
let rootIndex = 0;
let totalRootIndex = 0;
let fungiIndex = 0;
let totalFungiIndex = 0;

// Test class for Roots
class RootStructure {
    constructor(startingY, startingX, growthLimit, growthSpeed, elementName, startingSpeed, index) {
        this.startingY = startingY;
        this.startingX = startingX;
        this.y = startingY;
        this.x = startingX;
        // Reference it in the list of roots
        this.index = index;
        // Every growthSpeed number of time steps, it will grow (Higher growthSpeed means it grows slower)
        this.growthSpeed = growthSpeed;
        this.maxGrowthLength = growthLimit;
        this.length = 1;
        this.elementName = elementName;
        this.startingSpeed = startingSpeed;
    }

    // Determines if root should grow or not
    growBool(elementsArray, index, totalIndex) {
        if (this.length == this.maxGrowthLength) {
            console.log(this.length, "CANT GROW");
            // Remove from array if length is max
            elementsArray.splice(index, 1);
            totalIndex--;
            console.log(elementsArray, totalIndex);
            if (elementsArray == elements.rootTip.rootElements) {
                this.produceSugar();
            }
        }
        return ([(timeStep % this.growthSpeed == 0) && (this.length < this.maxGrowthLength), (totalIndex)]);
    }

    // Adjusts the growth speed depending on the current length
    updateGrowthSpeed() {
        // Pythagoras from starting location
        // let distance = Math.sqrt(Math.pow(Math.abs(this.y - this.startingY), 2) + (Math.pow(Math.abs(this.x - this.startingX), 2)));
        // Growth speed scaled according to difference in length from maxGrowthLength
        this.growthSpeed = Math.ceil(this.startingSpeed / (1 + this.maxGrowthLength / this.length));
        console.log("GROWTH SPEED", this.growthSpeed);
    }

    // Checks if neighboring cells are the specified element (left, right, down, down-left, and down-right)
    canGrow(y, x, element) {
        console.log(y, x);
        if (grid[y][x - 1] === element &&
            grid[y][x + 1] === element &&
            grid[y + 1][x] === element &&
            grid[y + 1][x - 1] === element &&
            grid[y + 1][x + 1] === element) {
            return true;
        }
        return false;
    }

    // Checks if cells are specified element. Eg. if adjDirection is 'left', checks top-left, top, left, bottom-left, down, cells
    canGrowFungi(y, x, adjDirection, element) {
        if (grid[y - 1][x + adjDirection] === element &&
            grid[y - 1][x] === element &&
            grid[y][x + adjDirection] === element &&
            grid[y + 1][x + adjDirection] === element &&
            grid[y + 1][x] === element) {
            return true;
        }
        return false;
    }

    // Fuction to grow root by one grid cell
    expandRoot(elementsArray, newElement, oldElement, index, totalIndex) {

        switch(newElement) {
            case 'rootTip':
                // Randomly choose -1, 0, or 1 for x growth direction (either grow left-down, down, right-down)
                let x_direction = Math.floor(Math.random() * 3) - 1;
                console.log("THISI S X DIRECTION FOR", x_direction, index);

                // Set the probability to branch into 2 roots
                let shouldBranch = Math.random() < 0.3;
                
                // LOGIC MAY BE INCORRECT HERE canGrow() DOESNT ACCOUNT FOR FUNGI 
                // If shouldBranch is true, and there is enough space to grow, grow 2 roots diagonally down in opposite directions
                if ( ( (grid[this.y + 1][this.x - 1] === 'soil' || grid[this.y + 1][this.x - 1] == 'fungi') && this.canGrow(this.y + 1, this.x - 1, 'soil')) &&
                    ( (grid[this.y + 1][this.x + 1] === 'soil' || grid[this.y + 1][this.x + 1] == 'fungi') && this.canGrow(this.y + 1, this.x + 1, 'soil')) && shouldBranch) {
                    grid[this.y + 1][this.x - 1] = 'soil';

                    console.log("CREATING ROOT TIP", newElement);
                    // Create a new rootTip object for branched root tip
                    let branchRootTip = new RootTip(this.y + 1, this.x + 1, totalIndex++);
                    branchRootTip.length = this.length + 2;
                    elementsArray.push(branchRootTip);

                    grid[this.y + 1][this.x + 1] = newElement;
                    grid[this.y][this.x] = oldElement;
                    // Update length
                    this.length += 2;
                    this.y++;
                    this.x--;
        
                // AGAIN DOES NOT ACCOUNT GOR FUNGI IN canGrow()
                // Not branching but there is enough space to grow, grow root in that singular direction
                } else if ((grid[this.y + 1][this.x + x_direction] === 'soil' || grid[this.y + 1][this.x + x_direction] === 'fungi') && this.canGrow(this.y + 1, this.x + x_direction, 'soil')) {
                    // Update length
                    this.length += 1;
                    grid[this.y + 1][this.x + x_direction] = newElement;
                    grid[this.y][this.x] = oldElement;
                    this.y++;
                    this.x += x_direction;
                
                // THIS WILL NOT WORK, canGrow() is always false here
                // Just grow at the same height and branch out sideways
                } else if ((grid[this.y][this.x + x_direction] === 'soil' || grid[this.y][this.x + x_direction] === 'fungi') && this.canGrow(this.y, this.x + x_direction, 'soil')) {
                    // Update length
                    this.length += 1;
                    grid[this.y][this.x + x_direction] = newElement;
                    grid[this.y][this.x] = oldElement;
                    this.x += x_direction;

                // DO WE NEED TO DECREMENT totalindex HERE?
                // If no block is below the root, remove root
                } else if (grid[this.y + 1][this.x] === null) {
                    grid[this.y][this.x] = null;
                }
                else {
                    // No space to grow
                    if ((grid[this.y + 1][this.x - x_direction] != 'soil' && !(this.canGrow(this.y + 1, this.x - x_direction, 'soil'))) || 
                        (grid[this.y + 1][this.x - x_direction] != 'fungi')) {
                        // Remove from array
                        console.log("REMOVING");
                        elementsArray.splice(index, 1);
                        totalIndex--;
                    }
                    console.log("CANT DO ANYTHING");
                }
                break;

            case 'fungi':
                // Randomly choose -1 or 1 for x growth direction (left or right)
                const x_dir = Math.random() < 0.5 ? -1 : 1;

                // Randomly choose -1, 0, 1 for y growth direction (combine with x_dir to grow sideways or diagonally, but never vertically)
                const y_dir = Math.floor(Math.random() * 3) - 1;

                // Set probability for roots to branch
                const fungiBranch = Math.random() < 0.2;

                // If branching is possible in x_direction, grow 2 roots
                if (grid[this.y - 1][this.x + x_dir] === 'soil' && this.canGrowFungi(this.y - 1, this.x + x_dir, x_dir, 'soil') &&
                    grid[this.y + 1][this.x + x_dir] === 'soil' && this.canGrowFungi(this.y + 1, this.x + x_dir, x_dir, 'soil') && fungiBranch) {
                
                    // Create a new fungi object for branched fungi
                    let branchFungi = new Fungi(this.y + 1, this.x + x_dir, totalIndex++);
                    branchFungi.length = this.length + 2;
                    elementsArray.push(branchFungi);
                    grid[this.y + 1][this.x + x_dir] = newElement;

                    grid[this.y - 1][this.x + x_dir] = newElement;
                    this.y--;
                    this.x += x_dir;
                    this.length += 2;
                // If branching is possible in direction opposite to x_dir, grow 2 roots
                } else if (grid[this.y - 1][this.x - x_dir] === 'soil' && this.canGrowFungi(this.y - 1, this.x - x_dir, x_dir, 'soil') &&
                    grid[this.y + 1][this.x - x_dir] === 'soil' && this.canGrowFungi(this.y + 1, this.x - x_dir, -x_dir, 'soil') && fungiBranch) {
                    
                    // Create a new fungi object for branched fungi
                    let branchFungi = new Fungi(this.y + 1, this.x - x_dir, totalIndex++);
                    branchFungi.length = this.length + 2;
                    elementsArray.push(branchFungi);

                    grid[this.y - 1][this.x - x_dir] = newElement;
                    grid[this.y][this.x] = newElement;
                    this.y--;
                    this.x -= x_dir;
                    this.length += 2;
                
                // Not branching but enough space to grow in x_dir, grow 1 root
                } else if(grid[this.y + y_dir][this.x + x_dir] === 'soil' && this.canGrowFungi(this.y + y_dir, this.x + x_dir, x_dir, 'soil')) {
                    // Update length
                    this.length += 1;
                    grid[this.y + y_dir][this.x + x_dir] = newElement;
                    grid[this.y][this.x] = oldElement;
                    this.y += y_dir;
                    this.x += x_dir;
                
                // Not branching but there is space to grow in opposite direction of x_dir, grow 1 root
                } else if (grid[this.y + y_dir][this.x - x_dir] === 'soil' && this.canGrowFungi(this.y + y_dir, this.x - x_dir, -x_dir, 'soil')) {
                    // Update length
                    this.length += 1;
                    grid[this.y + y_dir][this.x - x_dir] = newElement;
                    grid[this.y][this.x] = oldElement;
                    this.y += y_dir;
                    this.x -= x_dir;
                
                // If no block is below the root, remove root
                } else if (grid[this.y + y_dir][this.x + x_dir] === null) {
                    grid[this.y][this.x] = null;

                } else {
                    // If there's no space to grow, mark as fully grown
                    if (grid[this.y + y_dir][this.x + x_dir] != 'soil' && !(this.canGrowFungi(this.y + y_dir, this.x + x_dir, x_dir, 'soil'))) {
                        elementsArray.splice(index, 1);
                        totalIndex--;
                    }
                }
            }

        this.updateGrowthSpeed();
        console.log("UPDATED GROWTH SPEED", totalIndex, totalRootIndex);
        return totalIndex;
    }

    // Function to produce liquid sugar around the rootTip
    produceSugar() {
        // Choose the rage around rootTip where sugar is produced
        const sugarRange = 1;
        
        for (let y = this.y - sugarRange; y <= this.y + sugarRange; y++) {
            for (let x = this.x - sugarRange; x <= this.x + sugarRange; x++) {
                // Check if the grid cell is within bounds and contains soil
                if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth && grid[y][x] === 'soil') {
                    // Replace soil with liquidsugar
                    grid[y][x] = 'liquidSugar';
                }
            }
        }
    }
}

// Class for Roots
class RootTip extends RootStructure{
    constructor(startingY, startingX, index) {
        super(startingY, startingX, 20, 100, 'rootTip', 1000, index);
    }

}

class Fungi extends RootStructure{
    constructor(startingY, startingX, index) {
        super(startingY, startingX, 12, 50, 'fungi', 1000, index);
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
        rootElements: [],
        behavior: [],
    },

    liquidSugar: {
        color: "#ffbf00",
        behavior: [],
    },

    fungi: {
        color: "white",
        fungiElements: [],
        behavior: [],
    },
};

let elementId = 0;
for(const elementName in elements){
    elements[elementName].id = elementId++;
}




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

    if (totalRootIndex > 0) {
        curr = elements[grid[y][x]].rootElements[rootIndex];
        result = curr.growBool(elements.rootTip.rootElements, rootIndex, totalRootIndex);
        totalRootIndex = result[1];
        // If root is not at max size, expand root
        if (result[0]) {
            totalRootIndex = curr.expandRoot(elements.rootTip.rootElements, 'rootTip', 'root', rootIndex, totalRootIndex);
        }
        rootIndex++;
        if (rootIndex >= totalRootIndex) {
            rootIndex = 0;
        }
    }
});


elements.fungi.behavior.push(function (y, x, grid) {
    
    if (totalFungiIndex > 0) {
        curr = elements[grid[y][x]].fungiElements[fungiIndex];
        result = curr.growBool(elements.fungi.fungiElements, fungiIndex, totalFungiIndex);
        totalFungiIndex = result[1];

        // If fungi is not at max size, grow
        if (result[0]) {
                totalFungiIndex = curr.expandRoot(elements.fungi.fungiElements, 'fungi', 'fungi', fungiIndex, totalFungiIndex);
        }
        fungiIndex++;
        if (fungiIndex >= totalFungiIndex) {
            fungiIndex = 0;
        }
    }
});

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
        console.log("CURRENTLY", currentParticleType);
    } else {
        // Place the current element on the grid with Mouse1
        grid[y][x] = currentParticleType;
        console.log("PLACING");
        console.log(currentParticleType);
        if (currentParticleType == 'rootTip') {
            console.log("PLACING ROOT Tip");
            elements[currentParticleType].rootElements.push(new RootTip(y, x, totalRootIndex++));
        } else if (currentParticleType == 'fungi') {
            elements[currentParticleType].fungiElements.push(new Fungi(y, x, true, totalFungiIndex++));
        }
    }
});




function loop() {
    updateGrid();
    drawGrid();
    requestAnimationFrame(loop);
    timeStep++;
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

    // // grow some roots
    grid[79][25] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 25, totalRootIndex++));
    grid[79][75] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 75, totalRootIndex++));
    grid[79][90] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 90, totalRootIndex++));
    grid[79][160] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 160, totalRootIndex++));
    grid[79][165] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 165, totalRootIndex++));



    // Initialize some fungi
    grid[100][50] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(100, 50, totalFungiIndex++));
    grid[90][130] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(90, 130, totalFungiIndex++));
    grid[110][150] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(110, 150, totalFungiIndex++));
    grid[90][110] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(90, 110, totalFungiIndex++));
    grid[100][75] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(100, 75, totalFungiIndex++));

    // Call any other functions required to render the grid on the canvas.
}