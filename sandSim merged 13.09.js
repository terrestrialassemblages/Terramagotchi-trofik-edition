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

// Variables for stone
let stoneIdCounter = 0;
let stoneColors = {};


class RootStructure {
    constructor(startingY, startingX, growthLimit, growthSpeed, elementName, startingSpeed, index) {
        this.startingY = startingY;
        this.startingX = startingX;
        this.y = startingY;
        this.x = startingX;
        this.index = index;        // Reference it in the list of roots
        this.growthSpeed = growthSpeed;         // Every growthSpeed number of time steps, it will grow (Higher growthSpeed means it grows slower)
        this.maxGrowthLength = growthLimit;
        this.length = 1;
        this.elementName = elementName;
        this.startingSpeed = startingSpeed;
        this.nutrientBoosted = false;
        this.developed = false;    // If root is not developed, it will grow. If fully developed, it will produce sugar instead of growing
    }

    // Determines if root should grow or not
    //////////// LATER NEED TO REMOVE INPUT PARAMETERS AS THEY ARE NOT USED AND ADJUST BEHAVIOUR FOR FUNGI AND ROOT TIP 
    growBool(elementsArray, index, totalIndex) {
        if (this.length == this.maxGrowthLength) {
            // Mark the root as Developed
            this.developed = true;
            console.log(totalIndex, this.developed, "SET TO DEVELOPED");
            console.log(this.length, "CANT GROW");
        }
        if (this.developed == true && this.elementName == 'rootTip') {
            // If root is developed, produce sugar
            this.produceSugar();
            return ([false, totalIndex]);
        }
        return ([(timeStep % this.growthSpeed == 0) && (this.length < this.maxGrowthLength), (totalIndex)]);
    }

    sugarEaten() {
        // If developed == true, and there is no sugar surrounding the root, sugar must have been eaten. Set developed to false and increase max_growth length
        // IMPLEMENT LATER
    }

    // Adjusts the growth speed depending on the current length
    updateGrowthSpeed() {
        // Pythagoras from starting location
        // let distance = Math.sqrt(Math.pow(Math.abs(this.y - this.startingY), 2) + (Math.pow(Math.abs(this.x - this.startingX), 2)));
        // Growth speed scaled according to difference in length from maxGrowthLength
        this.growthSpeed = Math.ceil(this.startingSpeed / (1 + this.maxGrowthLength / this.length));
        console.log("GROWTH SPEED", this.growthSpeed);
    }

    // Checks neighboring cells
    canGrow(y, x, element, rootTipBool) {
        console.log(y, x);
        let element2 = 'fungi';
        if (rootTipBool == false) {
            element2 = 'root';
        }
        if ((grid[y][x - 1] === element || grid[y][x - 1] == element2) &&
            (grid[y][x + 1] === element || grid[y][x + 1] == element2) &&
            (grid[y + 1][x] === element || grid[y + 1][x] == element2) &&
            (grid[y + 1][x - 1] === element || grid[y + 1][x - 1] == element2) &&
            (grid[y + 1][x + 1] === element || grid[y + 1][x + 1] == element2)) {
            return true;
        }
        return false;
    }

    // Function to produce liquid sugar from root tip
    produceSugar() {
        if (grid[this.y][this.x] == 'rootTip') {
            // Produce sugar to the left, right, and under root tip if there is space
            console.log("PRODUCING SUGAR");
            if (grid[this.y][this.x - 1] === 'soil') {
                grid[this.y][this.x - 1] = 'liquidSugar';
                //elements.liquidSugar.sugarElements.push(new LiquidSugar(this.y, this.x - 1, this));
            }
            if (grid[this.y][this.x + 1] === 'soil') {
                grid[this.y][this.x + 1] = 'liquidSugar';
                //elements.liquidSugar.sugarElements.push(new LiquidSugar(this.y, this.x + 1, this));
            }
            if (grid[this.y + 1][this.x] === 'soil') {
                grid[this.y + 1][this.x] = 'liquidSugar';
                //elements.liquidSugar.sugarElements.push(new LiquidSugar(this.y + 1, this.x, this));
            }
        }
    }

    // Fuction to grow root by one grid cell
    expandRoot(elementsArray, newElement, oldElement, index, totalIndex) {

        // Randomly choose -1, 0, or 1 for x growth direction (either grow left-down, down, right-down)
        let x_direction = Math.floor(Math.random() * 3) - 1;

        console.log("GROWING", newElement, index);

        // Change function depending on if expandRoot is for fungi or rootTip
        let element2 = 'fungi';
        let rootTipBool = true;
        let prob = 0.5;

        if (newElement == 'fungi') {
            element2 = 'root';
            rootTipBool = false;
            prob = 0.3;
        }

        if (newElement == 'fungi' && this.branchElemenet != null && this.branchElement.attached == true && this.nutrientBoosted == false) {
            this.growthSpeed = Math.ceil(this.growthSpeed * (2 / 3));
            this.startingSpeed = Math.ceil(this.startingSpeed * (2 / 3));
            this.nutrientBoosted = true;
        }

        // Set the probability to branch into 2 roots
        let shouldBranch = Math.random() < prob;

        // If shouldBranch is true, and there is enough space to grow, grow 2 roots diagonally down in opposite directions (enough space means the grid it is growing onto + both adjacent grids to that are soil)
        if (((grid[this.y + 1][this.x - 1] === 'soil' || grid[this.y + 1][this.x - 1] == element2) && this.canGrow(this.y + 1, this.x - 1, 'soil', rootTipBool)) &&
            ((grid[this.y + 1][this.x + 1] === 'soil' || grid[this.y + 1][this.x + 1] == element2) && this.canGrow(this.y + 1, this.x + 1, 'soil', rootTipBool)) && shouldBranch) {
            
            // GROWS TOO QUICK IF YOU HAVE THIS. BUT THIS IS CORRECT IMPLEMENTATION
            // grid[this.y + 1][this.x - 1] = 'rootTip';

            // Incorrect implementation but grows at desired speed
            grid[this.y + 1][this.x - 1] = 'soil';


            switch (newElement) {
                case 'rootTip':
                    console.log("CREATING ROOT TIP", newElement);
                    // Create a new rootTip object for branched root tip
                    let branchRootTip = new RootTip(this.y + 1, this.x + 1, totalIndex++);
                    branchRootTip.length = this.length + 2;
                    elementsArray.push(branchRootTip);
                    break;
                case 'fungi':
                    console.log("CREATING FUNGI", newElement);
                    // Create a new rootTip object for branched root tip
                    let branchFungi = new Fungi(this.y + 1, this.x + 1, false, totalIndex++);
                    branchFungi.length = this.length + 2;
                    branchFungi.branchElement = this.branchElement;
                    elementsArray.push(branchFungi);
                    break;
            }

            grid[this.y + 1][this.x + 1] = newElement;
            grid[this.y][this.x] = oldElement;
            // Update length
            this.length += 2;
            this.y++;
            this.x--;

            // Not branching but there is enough space to grow, grow in that direction
        } else if ((grid[this.y + 1][this.x + x_direction] === 'soil' || grid[this.y + 1][this.x + x_direction] === element2) && this.canGrow(this.y + 1, this.x + x_direction, 'soil', rootTipBool)) {
            // Update length
            this.length += 1;
            grid[this.y + 1][this.x + x_direction] = newElement;
            grid[this.y][this.x] = oldElement;
            this.y++;
            this.x += x_direction;
            // Just grow at the same height and branch out sideways
        } else if ((grid[this.y][this.x + x_direction] === 'soil' || grid[this.y][this.x + x_direction] === element2) && this.canGrow(this.y, this.x + x_direction, 'soil', rootTipBool)) {
            // Update length
            this.length += 1;
            grid[this.y][this.x + x_direction] = newElement;
            grid[this.y][this.x] = oldElement;
            this.x += x_direction;

            // If no block is below the root, remove root
        } else if (grid[this.y + 1][this.x] === null) {
            grid[this.y][this.x] = null;
        }
        /////// NEED TO FIX THIS PART IF REIMPLEMENTING. SO WE DONT REMOVE ROOTTIP FROM ARRAY
/*        else {
            // No space to grow
            if ((grid[this.y + 1][this.x - x_direction] != 'soil' ||
                (grid[this.y + 1][this.x - x_direction] != element2)) && !(this.canGrow(this.y + 1, this.x - x_direction, 'soil', rootTipBool))) {
                // Remove from array
                console.log("REMOVING");
                elementsArray.splice(index, 1);
                totalIndex--;
            }
            console.log("CANT DO ANYTHING");
        }*/

        this.updateGrowthSpeed();
        console.log("UPDATED GROWTH SPEED", totalIndex, totalRootIndex);
        return totalIndex;
    } 
    
}

// Test class for Roots
class RootTip extends RootStructure {
    constructor(startingY, startingX, index) {
        super(startingY, startingX, 30, 100, 'rootTip', 1000, index);
    }
}

class Fungi extends RootStructure {
    // Fungi will first start at a location and branch out normally like rootTip
    // It will then find the nearest rootTip and do 1 singular branch to it while still branching out normally
    constructor(startingY, startingX, branchingToRoot, index) {
        if (branchingToRoot == true) {
            super(startingY, startingX, 50, 700, 'fungi', 5000, index);
        }
        else {
            super(startingY, startingX, 10, 700, 'fungi', 5000, index);
        }
        this.attached = false;
        this.branchingToRoot = branchingToRoot;
        this.attachedRootCoord = [null, null];
        this.attachedRootDistance = [null, null];
        this.nearestRootFound = false;
        this.branchElement = null;
        this.branchedRoots = [];
    }

    findRootTip() {
        console.log("FINDING ROOT TIP");
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let minDistance = Number.MAX_VALUE;
        for (let i = 0; i < totalRootIndex; i++) {
            curr = elements.rootTip.rootElements[i];
            console.log("TESTING X", curr.x, curr.y, this.x, this.y);
            // Find pathagoras distance away from it
            let distance = Math.sqrt(Math.pow(this.x - curr.x, 2) + Math.pow(this.y - curr.y, 2));
            if (distance < minDistance) {
                console.log("FOUND MIN", distance, minDistance, minX, minY, curr.x, curr.y);
                minDistance = distance;
                // Could just set to the element itself and not its exact coordinates at that point
                minX = curr.x;
                minY = curr.y;
            }
        }
        this.attachedRootCoord[0] = minY;
        this.attachedRootCoord[1] = minX;
        this.attachedRootDistance[0] = minY - this.y;
        this.attachedRootDistance[1] = minX - this.x;
        this.nearestRootFound = true;
        console.log("NEAREST ROOT", this.attachedRootCoord, this.y, this.x, this.attachedRootDistance);
    }

    expandFungiToRoot() {
        console.log("EXPANDING TO ROOT", rootIndex, this.growthSpeed, timeStep);
        // Nothing can stop Fungi as it can go through aggregates and can simply work around the bacteria
        if ((grid[this.y + 1][this.x] == 'root' || grid[this.y + 1][this.x] == 'rootTip') || (grid[this.y - 1][this.x] == 'root' || grid[this.y - 1][this.x] == 'rootTip')
            || (grid[this.y][this.x + 1] == 'root' || grid[this.y][this.x + 1] == 'rootTip') || (grid[this.y][this.x - 1] == 'root' || grid[this.y][this.x - 1] == 'rootTip')
            || (grid[this.y][this.x] == 'root' || grid[this.y][this.x] == 'rootTip')) {
            this.branchingToRoot = false;
            this.attached = true;
            elements.fungi.fungiElements.splice(this.index, 1);
            totalFungiIndex--;
        }
        else {
            const dy = Math.sign(this.attachedRootDistance[0]) * Math.round(Math.random());
            const dx = Math.sign(this.attachedRootDistance[1]) * Math.round(Math.random());
            this.y += dy;
            this.x += dx;
            this.attachedRootDistance[0] += -dy;
            this.attachedRootDistance[1] += -dx;
            grid[this.y][this.x] = 'fungi';
            this.length += Math.abs(dy);
            this.length += Math.abs(dx);
        }
        this.updateGrowthSpeed();


        /*                if (this.attachedRootDistance[0] != 0 ) {
                            // Move up
                            if (this.attachedRootDistance[0] < 0) {
                                grid[--this.y][this.x] = 'fungi';
                                this.attachedRootDistance[0]--;
                            }
                            else {
                                grid[++this.y][this.x] = 'fungi';
                                this.attachedRootDistance[0]++;
                            }
                        }
        
                        if (x_branch == 1 && this.attachedRootDistance[1] != 0) {
                            // Move up
                            if (this.attachedRootDistance[1] < 0) {
                                grid[this.y][--this.x] = 'fungi';
                                this.attachedRootDistance[1]--;
                            }
                            else {
                                grid[this.y][++this.x] = 'fungi';
                                this.attachedRootDistance[1]++;
                            }
                        }*/
    }
}

const elements = {
    sand: {
        color: "#FFD700",
        behavior: [],
    },
    soil: {
        color: "#452c1b",
        behavior: [],
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
        color: "#4d4436",
        max_size: 30,       // Biggest size a root can grow to
        behavior: [],
    },
    rootTip: {
        color: "#6b5e4a",
        rootElements: [],
        behavior: [],
    },

    fungi: {
        color: "white",
        fungiElements: [],
        behavior: [],
    },
    liquidSugar: {
        color: "yellow",
        behavior: [],
    }
};

// let elementId = 0;
// for (const elementName in elements) {
//     elements[elementName].id = elementId++;
// }

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

elements.stone.behavior.push(function (y, x, grid) {
});

elements.water.behavior.push(function (y, x, grid) {
    if (grid[y + 1][x] === null) {
        grid[y + 1][x] = 'water';
        grid[y][x] = null;
    }
    else if (grid[y + 1][x] === 'soil') {
        if (Math.random() < 0.2) {
            grid[y + 1][x] = 'water';
            grid[y][x] = 'water';
        }
    }
    else if (grid[y + 1][x].startsWith('stone-')) {
        const randomDirection = Math.random() < 0.5 ? -1 : 1;
        const newX = x + randomDirection;
        if (newX >= 0 && newX < gridWidth && grid[y][newX] === null) {
            grid[y + 1][newX] = 'water';
            grid[y][x] = null;
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

    // For every RootTip instance in the grid array, check if it can grow
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
        // If root is not at max size, expand root
        result = curr.growBool(elements.fungi.fungiElements, fungiIndex, totalFungiIndex);
        totalFungiIndex = result[1];
        if (result[0]) {
            // Branch out the root tip and attach to it
            if (curr.branchingToRoot == true && curr.attached == false) {
                if (curr.nearestRootFound == false) {
                    // Find the closest root tip at that moment
                    curr.findRootTip();
                }
                else {
                    curr.expandFungiToRoot();
                }
            }
            else {
                totalFungiIndex = curr.expandRoot(elements.fungi.fungiElements, 'fungi', 'fungi', fungiIndex, totalFungiIndex);
            }
        }
        fungiIndex++;
        if (fungiIndex >= totalFungiIndex) {
            fungiIndex = 0;
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

// function drawGrid() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     for (let y = 0; y < gridHeight; y++) {
//         for (let x = 0; x < gridWidth; x++) {
//             if (grid[y][x] in elements) {
//                 ctx.fillStyle = elements[grid[y][x]].color;
//                 ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
//             }
//         }
//     }

// }
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const element = grid[y][x];
            if (element && element.startsWith('stone-')) {
                if (isBoundary(x, y, grid, element)) {
                    // If it's a boundary pixel, paint it black
                    ctx.fillStyle = "#140e01"; // black color for outline
                } else {
                    ctx.fillStyle = stoneColors[element];
                }
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            
            } 
            
            else if (element in elements) {
                ctx.fillStyle = elements[element].color;
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
        console.log(currentParticleType);
        if (currentParticleType == 'rootTip') {
            elements[currentParticleType].rootElements.push(new RootTip(y, x, totalRootIndex++));
        }
        else if (currentParticleType == 'fungi') {
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

// Run once at the start to initialize the grid
window.addEventListener('load', function () {
    // Logic to draw sand on the canvas automatically
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    loop();
    //drawSandAutomatically();
    drawFungiAutomatically();
    drawSoilAutomatically();
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

    // Grow some fungi
    // Testing fungi for root 1
    grid[84][21] = 'fungi';
    let newFungi = new Fungi(84, 21, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    let rootBranch = new Fungi(84, 21, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;

    grid[90][29] = 'fungi';
    newFungi = new Fungi(90, 29, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    // Root that will branch to RootTip
    rootBranch = new Fungi(90, 29, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;


    // Testing fungi for root 2
    grid[85][72] = 'fungi';
    newFungi = new Fungi(85, 72, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    rootBranch = new Fungi(85, 72, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;

    grid[87][75] = 'fungi';
    newFungi = new Fungi(87, 75, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    rootBranch = new Fungi(87, 75, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;

    grid[85][78] = 'fungi';
    newFungi = new Fungi(85, 78, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    rootBranch = new Fungi(85, 78, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;

    // Testing fungi for root 3
    grid[83][87] = 'fungi';
    newFungi = new Fungi(83, 87, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    rootBranch = new Fungi(83, 87, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;

    grid[84][95] = 'fungi';
    newFungi = new Fungi(84, 95, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    rootBranch = new Fungi(84, 95, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;

    // Call any other functions required to render the grid on the canvas.
}

function drawFungiAutomatically() {
    // Logic to draw sand on the canvas
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    // For example:

    // fill background up with soil
    /*
    for (let i = 80; i < 150; i++) {
        for (let j = 0; j < 200; j++) {
            grid[i][j] = 'soil';
        }
    }
    */
    // // grow some roots
    grid[79][25] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 25, totalRootIndex++));
    grid[79][75] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 75, totalRootIndex++));
    grid[79][90] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 90, totalRootIndex++));
    // Grow some fungi
    // Testing fungi for root 1
    grid[84][21] = 'fungi';
    let newFungi = new Fungi(84, 21, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    let rootBranch = new Fungi(84, 21, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;
    grid[90][29] = 'fungi';
    newFungi = new Fungi(90, 29, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    // Root that will branch to RootTip
    rootBranch = new Fungi(90, 29, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;

    // Testing fungi for root 2
    grid[85][72] = 'fungi';
    newFungi = new Fungi(85, 72, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    rootBranch = new Fungi(85, 72, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;
    grid[87][75] = 'fungi';
    newFungi = new Fungi(87, 75, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    rootBranch = new Fungi(87, 75, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;
    grid[85][78] = 'fungi';
    newFungi = new Fungi(85, 78, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    rootBranch = new Fungi(85, 78, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;
    // Testing fungi for root 3
    grid[83][87] = 'fungi';
    newFungi = new Fungi(83, 87, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    rootBranch = new Fungi(83, 87, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;
    grid[84][95] = 'fungi';
    newFungi = new Fungi(84, 95, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(newFungi);
    rootBranch = new Fungi(84, 95, true, totalFungiIndex++);
    elements.fungi.fungiElements.push(rootBranch);
    newFungi.branchElement = rootBranch;
    // Call any other functions required to render the grid on the canvas.
}

function drawSoilAutomatically() {
    // water
    for (let y = 130; y < 150; y++) {
        for (x = 0; x < gridWidth; x++) {
            if (grid[y][x] === null) {
                grid[y][x] = 'water';
            }
        }
    }
    for (let y = 80; y < 150; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === null) {
                grid[y][x] = 'soil';
            }
            if (grid[y][x] === 'water' || grid[y][x] === 'soil') {
                if (Math.random() < 0.005) {
                    let stoneSizeX = Math.floor(Math.random() * 2) + 4;
                    let stoneSizeY = Math.floor(Math.random() * 2) + 4;
                    const stoneId = `stone-${stoneIdCounter++}`;
                    const variation = Math.floor(Math.random() * 20) - 10; // Random value between -10 and 10
                    stoneColors[stoneId] = adjustColor(elements.stone.color, variation);
                    for (let i = 0; i < stoneSizeX; i++) {
                        for (let j = 0; j < stoneSizeY; j++) {
                            const stoneX = x + i;
                            const stoneY = y - j;
                            const rotationAngle = Math.random() * Math.PI * 2;
                            for (let i = 0; i < stoneSizeX; i++) {
                                for (let j = 0; j < stoneSizeY; j++) {
                                    const stoneX = x + i;
                                    const stoneY = y - j;
                                    // Calculate elliptical values with increased noise
                                    const noise = Math.random() * 0.3 - 0.15;
                                    let ellipseX = (i - stoneSizeX / 2 + noise) / (stoneSizeX / 2);
                                    let ellipseY = (j - stoneSizeY / 2 + noise) / (stoneSizeY / 2);
                                    // Rotate the coordinates
                                    const rotatedX = ellipseX * Math.cos(rotationAngle) - ellipseY * Math.sin(rotationAngle);
                                    const rotatedY = ellipseX * Math.sin(rotationAngle) + ellipseY * Math.cos(rotationAngle);
                                    // Use the elliptical equation to determine if a pixel is inside the ellipse
                                    if (rotatedX * rotatedX + rotatedY * rotatedY <= 1) {
                                        grid[stoneY][stoneX] = stoneId;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
}
// Function used to get color of stone?
function adjustColor() {
    const colors = ["#2a1f04", "#362804", "#201703"];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

function isStone(cell) {
    return cell && cell.startsWith('stone-');
}
function isBoundary(x, y, grid, stoneId) {
    if (x > 0 && !isStone(grid[y][x - 1])) return true;          // Left
    if (x < gridWidth - 1 && !isStone(grid[y][x + 1])) return true; // Right
    if (y > 0 && !isStone(grid[y - 1][x])) return true;          // Above
    if (y < gridHeight - 1 && !isStone(grid[y + 1][x])) return true; // Below
    return false;
}