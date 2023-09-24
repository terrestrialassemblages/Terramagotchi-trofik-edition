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
    growBool(totalIndex) {
        // If root is at max size, stop growing
        if (this.length == this.maxGrowthLength) {
            // Mark the root as Developed
            this.developed = true;
        }
        if (this.developed == true && this.elementName == 'rootTip') {
            // If root is developed, produce sugar
            this.produceSugar();
            //console.log("FULLY GROWN, PRODUCING SUGAR");
            return ([false, totalIndex]);
        }
        return ([(timeStep % this.growthSpeed == 0) && (this.length < this.maxGrowthLength), (totalIndex)]);
    }

    sugarEaten() {
        // If developed == true, and a full bacteria that has eaten liquid sugar touches the tip of the root, increase length of the root.
        // Set developed to false and increase max_growth length for rootTip

        // IMPLEMENT LATER
    }

    // Adjusts the growth speed depending on the current length
    updateGrowthSpeed() {
        // Pythagoras from starting location
        // let distance = Math.sqrt(Math.pow(Math.abs(this.y - this.startingY), 2) + (Math.pow(Math.abs(this.x - this.startingX), 2)));
        // Growth speed scaled according to difference in length from maxGrowthLength
        this.growthSpeed = Math.ceil(this.startingSpeed / (1 + this.maxGrowthLength / this.length));
    }

    // Checks neighboring cells
    canGrow(y, x, element, rootTipBool) {
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
    // CHANGED TO PRODUCE ONLY 1 LIQUID SUGAR AT A TIME, CURRENTLY DOES NOT RESTORE THE PREVIOUS BLOCK IF LIQUID SUGAR GETS EATEN
    produceSugar() {
        if (grid[this.y][this.x] == 'rootTip') {

            // If the block below is soil or fungi, produce liquid sugar
            if (grid[this.y + 1][this.x] === 'soil' || grid[this.y + 1][this.x] === 'fungi') {
                grid[this.y + 1][this.x] = 'liquidSugar';
            }
        }
    }

    // Fuction to grow root by one block
    expandRoot(elementsArray, index, totalIndex) {

        console.log("EXPANDING ROOT NOW", this.elementName);

        // Randomly choose -1, 0, or 1 for x growth direction (either grow left-down, down, right-down)
        let x_direction = Math.floor(Math.random() * 3) - 1;

        // Set initial values
        let rootTipBool = true;
        let prob = 0.2;

        // Set the probability to branch into 2 roots
        let shouldBranch = Math.random() < prob;

        // If shouldBranch is true, and there is enough space to grow, grow an additional branch in the bottom right direction
        if (((grid[this.y + 1][this.x - 1] === 'soil' || grid[this.y + 1][this.x - 1] == 'fungi') && this.canGrow(this.y + 1, this.x - 1, 'soil', rootTipBool)) &&
            ((grid[this.y + 1][this.x + 1] === 'soil' || grid[this.y + 1][this.x + 1] == 'fungi') && this.canGrow(this.y + 1, this.x + 1, 'soil', rootTipBool)) && shouldBranch) {

            // Create a new rootTip object for new branch
            grid[this.y + 1][this.x + 1] = 'rootTip';
            let branchRootTip = new RootTip(this.y + 1, this.x + 1, totalIndex++);
            branchRootTip.length = this.length + 2;
            elementsArray.push(branchRootTip);

            // Produce sugar at branching point
            this.produceSugar();
            console.log("BRANCHING, PRODUCE SUGAR");

            // Update Current rootTip object
            grid[this.y][this.x] = 'root';
            this.length += 2;
            this.y++;
            this.x--;

            // Not branching but there is enough space to grow, grow in that direction
        } else if ((grid[this.y + 1][this.x + x_direction] === 'soil' || grid[this.y + 1][this.x + x_direction] === 'fungi') && this.canGrow(this.y + 1, this.x + x_direction, 'soil', rootTipBool)) {
            // Update length
            this.length += 1;
            grid[this.y + 1][this.x + x_direction] = 'rootTip';
            grid[this.y][this.x] = 'root';
            this.y++;
            this.x += x_direction;
            // Just grow at the same height and branch out sideways
        } else if ((grid[this.y][this.x + x_direction] === 'soil' || grid[this.y][this.x + x_direction] === 'fungi') && this.canGrow(this.y, this.x + x_direction, 'soil', rootTipBool)) {
            // Update length
            this.length += 1;
            grid[this.y][this.x + x_direction] = 'rootTip';
            grid[this.y][this.x] = 'root';
            this.x += x_direction;

            // If no block is below the root, remove root
        } else if (grid[this.y + 1][this.x] === null) {
            grid[this.y][this.x] = null;
        }

        this.updateGrowthSpeed();
        return totalIndex;
    }
}

// Test class for Roots
class RootTip extends RootStructure {
    constructor(startingY, startingX, index) {
        super(startingY, startingX, 10, 500, 'rootTip', 1000, index);
    }
}

class Fungi extends RootStructure {
    // Fungi will first start at a location and branch out normally like rootTip
    // It will then find the nearest rootTip and do 1 singular branch to it while still branching out normally
    constructor(startingY, startingX, branchingToRoot, index) {
        if (branchingToRoot == true) {
            super(startingY, startingX, 50, 700, 'fungi', 300, index);
        }
        else {
            super(startingY, startingX, 20, 200, 'fungi', 800, index);
        }
        // Variables for the fungi branch that will attach to the root
        this.attached = false;
        this.branchingToRoot = branchingToRoot;
        this.attachedRootCoord = [null, null];
        this.attachedRootDistance = [null, null];
        this.nearestRootFound = false;
        // Parent branched fungi element
        this.branchElement = null;
        // All the child roots that have branched on normally
        this.branchedRoots = [];
        // X and Y direction that the branch will grow
        this.expandXDir = Math.random() < 0.5 ? -1 : 1;
        this.expandYDir = 1;
        // Remaining branch counts
        this.branchCount = 5;
        // Spacing from other fungi branches
        this.spacing = 1;
        // Amount of times it stayed on same horizontal and vertical in a row
        this.countX = 0;
        this.countY = 0;
        // Branching probability
        this.branchProb = 0.4;
    }

    findRootTip() {
        //console.log("FINDING ROOT TIP");
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let minDistance = Number.MAX_VALUE;
        for (let i = 0; i < totalRootIndex; i++) {
            curr = elements.rootTip.rootElements[i];
            //console.log("TESTING X", curr.x, curr.y, this.x, this.y);
            // Find pathagoras distance away from it
            let distance = Math.sqrt(Math.pow(this.x - curr.x, 2) + Math.pow(this.y - curr.y, 2));
            if (distance < minDistance) {
                //console.log("FOUND MIN", distance, minDistance, minX, minY, curr.x, curr.y);
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
        //console.log("NEAREST ROOT", this.attachedRootCoord, this.y, this.x, this.attachedRootDistance);
    }

    expandFungiToRoot() {
        //console.log("EXPANDING TO ROOT", rootIndex, this.growthSpeed, timeStep);
        // Nothing can stop Fungi as it can go through aggregates and can simply work around the bacteria
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (grid[this.y + i][this.x + j] == 'root' || grid[this.y + i][this.x + j] == 'rootTip') {
                    this.branchingToRoot = false;
                    this.attached = true;
                    elements.fungi.fungiElements.splice(this.index, 1);
                    totalFungiIndex--;
                    //console.log("ATTACHED");
                    return;
                }
            }
        }
        const dy = Math.sign(this.attachedRootDistance[0]) * Math.round(Math.random());
        const dx = Math.sign(this.attachedRootDistance[1]) * Math.round(Math.random());
        this.y += dy;
        this.x += dx;
        this.attachedRootDistance[0] += -dy;
        this.attachedRootDistance[1] += -dx;
        grid[this.y][this.x] = 'fungi';
        this.length += Math.abs(dy);
        this.length += Math.abs(dx);
        this.updateGrowthSpeed();
    }

    // Should check 1 to right as well when going diagonal
    canGrow(y, x, yDir, xDir, forbElements) {
        for (let spaceY = -1; spaceY <= this.spacing; spaceY++) {
            for (let spaceX = -1; spaceX <= this.spacing; spaceX++) {
                //console.log("CANGROW CHECK", y, (yDir * spaceY), y + (yDir * spaceY), this.y, x, (xDir * spaceX), x + (xDir * spaceX), this.x);
                for (let element of forbElements) {
                    //console.log("CHECKING ELEMENT", element);
                    if (grid[y + (yDir * spaceY)][x + (xDir * spaceX)] == element) {
                        //console.log("FOUND FUNGI");
                        if (y + (yDir * spaceY) == this.y && (x + (xDir * spaceX)) == this.x) {
                            //console.log("CHECKING OG POS");
                            continue;
                        }
                        //console.log("CAN'T GROW")
                        return false;
                    }
                }
            }
        }
        //console.log("FUNGI CAN INDEED GROW HERE", y, x, xDir);
        return true;
    }

    updateSpacing() {
        // 1,2, 4, 4, 4, 
        if (this.length / this.maxGrowthLength > 0.5) {
            this.spacing = 2;
        }
        else if (this.spacing / this.maxGrowthLength > 0.7) {
            this.spacing = 3;
        }
    }

    // Fuction to grow fungi by one block, Fungi can only grow into soil
    expandRoot(elementsArray, index, totalIndex) {
        //console.log("EXPANDING FUNGI NOW", this.index, totalFungiIndex, totalIndex, this.countY, this.countX);
        let remove = false;
        let finalGrowDir = null;
        let growIndex = null;

        // Boost the fungi's growth once it has been attached to the plant root
        if (this.branchElemenet != null && this.branchElement.attached == true && this.nutrientBoosted == false) {
            this.growthSpeed = Math.ceil(this.growthSpeed * (2 / 3));
            this.startingSpeed = Math.ceil(this.startingSpeed * (2 / 3));
            this.nutrientBoosted = true;
        }

        /* There's 4 options for fungi to grow
        1. Straight vertical
        2. Straight horizontal
        3. Diagonally down
        4. (WHEN 1-3 FAILS) Diagonlly up */

        // 3 regular options
        let growOptions = [[this.expandYDir, this.expandXDir], [0, this.expandXDir], [this.expandYDir, 0]];

        // Don't grow vertically, been growing vertically for 2 pixels or just grew horizontally to prevent 90 degrees turn
        if (this.countY == 2 || (this.countX > 0 && this.countX != 2)) {
            growOptions.splice(2, 1);
        }

        // Don't grow horizontally, been growing horizontally for 2 pixels or just grew vertically
        else if (this.countX == 2 || (this.countY > 0 && this.countY != 2)) {
            growOptions.splice(1, 1);
        }

        //console.log("GROWING fungi", index);

        // Set initial values
        let rootTipBool = false;

        // Set the probability to branch into 2 roots
        let shouldBranch = Math.random() < this.branchProb;

        // Don't want the fungi to grow horizontally straight for more than 2 blocks in a row
        // Prefer to grow slanted
        // Main fungi can branch while the rest just grow slanted
        // If not enough space to go out in x direction, grow downwards
        // The longer it grows, the more space it has to be away from the rest
        // Probability of branching increases everytime
        // Only original fungi can go in -1 y_direction

        // If growing vertical twice in a row, must grow diagonal or horizontal
        // If growing horizontal twice in a row, must grow diagonal or vertical


        let forbElements = ['fungi'];

        // Find direction that the fungi can grow
        while (finalGrowDir == null && growOptions.length != 0) {
            growIndex = Math.floor(Math.random() * (growOptions.length));
            let testY = this.y;
            let testX = this.x;
            testY += growOptions[growIndex][0];
            testX += growOptions[growIndex][1];
            // Check grow direction
            if (this.canGrow(testY, testX, this.expandYDir, this.expandXDir, forbElements)) {
                finalGrowDir = growOptions[growIndex];
            }
            else {
                // Remove the option
                growOptions.splice(growIndex, 1);
                if (growOptions.length == 0) {
                    // Try last exception (grow sideways up)
                    testY = this.y - 1;
                    testX = this.x + this.expandXDir;
                    if (this.canGrow(testY, testX, -1, this.expandXDir, forbElements)) {
                        finalGrowDir = [-1, this.expandXDir];
                        this.expandYDir = -1;
                    }
                    else {
                        remove = true;
                    }
                }
            }
        }

        // No valid grow directions, so remove from fungiElements
        if (remove == true) {
            //console.log("REMOVING");
            elements.fungi.fungiElements.splice(this.index, 1);
            totalFungiIndex--;
            return;
        }

        let finalGrowY = finalGrowDir[0];
        let finalGrowX = finalGrowDir[1];


        // Resetting maxed out counters, can't go in same direction again and would have been removed if no valid options
        if (this.countY == 2) {
            this.countY = 0;
        }
        else if (this.countX == 2) {
            this.countX = 0;
        }
        // Growing vertical
        else if (finalGrowX == 0 && finalGrowY == this.expandYDir) {
            this.countY++;
        }
        // Growing horizontal
        else if (finalGrowY == 0 && finalGrowX == this.expandXDir) {
            this.countX++;
        }

        // If shouldBranch and the current branch can has space to grow
        if (this.branchCount > 0 && shouldBranch) {
            let branchFungi = null;
            let newX = this.x - this.expandXDir;
            let newY = this.y;
            let newXDir = -(this.expandXDir);
            let newYDir = this.expandYDir;
            // If original fungi grows horizontal, branch grows vertical
            if (finalGrowY == 0 && finalGrowX == this.expandXDir) {
                newY = this.y + 1;
                //console.log("BRANCING DOWN");
            }
            // If original fungi grows vertical (both up and down), branch goes horizontal
            else if (finalGrowX == 0 && finalGrowY == this.expandYDir) {
                //newX = this.x + this.expandXDir;
                //console.log("BRANCING HORIZ");
            }
            else if (finalGrowX == this.expandXDir && finalGrowY == this.expandYDir) {
                newY = this.y + 1;
                //console.log("BRANCING DIAG", finalGrowY, finalGrowX);
            }
            // If original fungi grows diagonal, branch
            // Diagonal must be downwards as if it is upwards, it mean that going 
            /*else {
                // y_direction will be the same
                // Switch xDir
                newXDir = -(this.expandXDir);
                console.log("BRANCING DIAG", finalGrowY, finalGrowX);
            }*/
            //console.log("CHECKING BRANCH", newXDir);
            if (this.canGrow(newY, newX, newYDir, newXDir, forbElements)) {
                //console.log("BRANCHING", newY, newX, this.y + finalGrowY, this.x + finalGrowX);
                let branchFungi = new Fungi(newY, newX, false, totalFungiIndex++);
                // Update all the variables
                branchFungi.expandXDir = newXDir;
                branchFungi.expandYDir = newYDir;
                branchFungi.branchCount = --this.branchCount;
                branchFungi.length = this.length + 1;
                branchFungi.branchElement = this.branchElement;
                branchFungi.nutrientBoosted = this.nutrientBoosted;
                branchFungi.spacing = this.spacing;
                branchFungi.updateSpacing();
                branchFungi.growthSpeed = this.growthSpeed;
                branchFungi.updateGrowthSpeed();
                elements.fungi.fungiElements.push(branchFungi);
                grid[branchFungi.y][branchFungi.x] = 'fungi';
            }
            else {
                this.branchProb += 0.02;
            }
            //console.log("CHANGING Y X BRANCH");
            this.y += finalGrowY;
            this.x += finalGrowX;
        }
        else {
            this.y += finalGrowY;
            this.x += finalGrowX;
            // Increase changes of branching
            this.brancProb += 0.02;
        }

        // If not root or root tip, grow over it
        if (grid[this.y][this.x] != 'root' && grid[this.y][this.x] != 'rootTip' && remove == false) {
            grid[this.y][this.x] = 'fungi';
        }
        this.length++;
        // If root or root tip, just go under it by not changing grid to fungi
        //this.updateGrowthSpeed();
        this.growthSpeed = Math.round(this.growthSpeed * 1.3);
        this.updateSpacing();
        //console.log("UPDATED VALUES", this.growthSpeed, this.spacing, this.length, totalFungiIndex);


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
        color: "#808080",
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

    // Update for every RootTip instance in the grid array
    if (totalRootIndex > 0) {

        // Get the current rootTip object and check if it can grow
        curr = elements[grid[y][x]].rootElements[rootIndex];
        result = curr.growBool(totalRootIndex);

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

});

elements.fungi.behavior.push(function (y, x, grid) {
    if (totalFungiIndex > 0) {
        curr = elements[grid[y][x]].fungiElements[fungiIndex];
        // If root is not at max size, expand root
        result = curr.growBool(totalFungiIndex);
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

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] in elements) {
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
        //console.log(currentParticleType);
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

window.addEventListener('load', function () {
    // Logic to draw sand on the canvas automatically
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    loop();
    drawAutomatically();
});

function drawAutomatically() {
    // Logic to preload elements onto the grid

    // fill background up with soil
    for (let i = 80; i < 150; i++) {
        for (let j = 0; j < 200; j++) {
            grid[i][j] = 'soil';
        }

    }

    // Grow some roots and fungi

    // 79 25
    grid[79][25] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 25, totalRootIndex++));
    grid[79][25] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(79, 25, false, totalFungiIndex++));
    

    // 79 75
    grid[79][75] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 75, totalRootIndex++));
    grid[79][75] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(79, 75, false, totalFungiIndex++));


    // 79 90
    grid[79][90] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(79, 90, totalRootIndex++));
    // grid[79][90] = 'fungi';
    // elements.fungi.fungiElements.push(new Fungi(79, 90, false, totalFungiIndex++));


    // 79 140
    grid[79][140] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(79, 140, false, totalFungiIndex++));
    


    // Call any other functions required to render the grid on the canvas.
}