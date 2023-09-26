const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');
const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));

// Variables for plant root and fungi 
let currentParticleType = 'rootTip';
let timeStep = 0;
let rootIndex = 0;
let totalRootIndex = 0;
let fungiIndex = 0;
let totalFungiIndex = 0;

// Variables for bacteria
let timeMove = 0;
let chosenDirection = null;
let bacteriaIndex = 0;
let totalBacteriaIndex = 29;
let processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));
let bacteriaDirection = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));


class Bacteria {
    constructor(color, frameTimer, currentDirection, directionTimer, behavior, x, y, lifespan) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.frameTimer = frameTimer;
        this.currentDirection = currentDirection;
        this.directionTimer = directionTimer;
        this.behavior = behavior;
        this.oldElement = "soil"  // Default value
        this.index = 0;
        this.lifespan = lifespan;
    }

    decreaseLifespan() {
        this.lifespan--;
    }
    
    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
    };
    
    createBacteriaHistoryTracker() {
        //let oldElement = "soil";  // Default value
    
        return function(newElement) {
            if (newElement == "liquidSugar"){
                newElement = "soil";
            }
            let output = this.oldElement;
            this.oldElement = newElement;
            return output;
        };
    }

    bacteriaHistory = this.createBacteriaHistoryTracker();
}


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
        // If exceeds boundaries
        if (y > gridHeight || y < 80 || x < 0 || x > gridWidth) {
            return false;
        }
        // Loops through one above, one below, to spacing
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
        color: "#7a5338",
        behavior: [],
    },
    aggregate: {
        color: '#4f3724',
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
    },
    bacteria: {
        color: "#800080", frameTimer: 15,
        bacteriaElements: [],
        behavior: [],
    },
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

elements.water.behavior.push(function (y, x, grid) {
    if (grid[y + 1][x] === null) {
        grid[y + 1][x] = 'water';
        grid[y][x] = null;
        //processed[y][x] = true;
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

elements.bacteria.behavior.push(function(y, x, grid) {
    let DISDANCE = 8;
    const result = IfNearLiquidSugar(DISDANCE, y, x);

    
    let ifNear = result.ifNear;
    let priorityDirection = result.priorityDirection;
    //console.log(priorityDirection);
    
    if(ifNear){
        //console.log(timeMove % elements.bacteria.frameTimer);
        if (timeMove % elements.bacteria.frameTimer == 0){
            
            chosenDirection = priorityDirection;
            //console.log(chosenDirection);

            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            bacteriaMovement(newY, newX, y, x);
        }
    }
    else{
        //console.log(timeMove % elements.bacteria.frameTimer);
        if (timeMove % elements.bacteria.frameTimer == 0){
            
            //directionTimer smaller change direction more frequentlly
            if(elements.bacteria.directionTimer % 5 !== 0){
                chosenDirection = choseDirection(bacteriaDirection[y][x], y, x);
            }
            else{
                if(bacteriaDirection[y][x] !== null){
                    chosenDirection = bacteriaDirection[y][x];
                    // If the bacteria is touching any boundary, choose a new direction
                    if(y == 0 || y == gridHeight - 1 || x == 0 || x == gridWidth - 1) {
                        chosenDirection = choseDirection(bacteriaDirection[y][x], y, x);
                    }
                }
                else{
                    chosenDirection = choseDirection(bacteriaDirection[y][x], y, x);
                }
            }
            elements.bacteria.directionTimer++;
            //console.log(chosenDirection);

            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            // If new position is out of bounds or occupied, choose a new direction
            /*
            let attempts = 0;
            while ((newY < 0 || newY >= gridHeight || newX < 0 || newX >= gridWidth || grid[newY][newX] !== null) && attempts < 4) {
                chosenDirection = choseDirection(elements.bacteria.currentDirection, true);
                newY = y + chosenDirection.dy;
                newX = x + chosenDirection.dx;
                attempts++;
            }
            */
            bacteriaMovement(newY, newX, y, x);
        }
    }
});

elements.liquidSugar.behavior.push(function (y, x, grid) {
    // If no block below, remove
    if (grid[y + 1][x] === null) {
        grid[y][x] = null;
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


function drawAutomatically() {
    // Logic to preload elements onto the grid

    // fill background up with soil
    for (let i = 80; i < 150; i++) {
        for (let j = 0; j < 200; j++) {
            grid[i][j] = 'soil';
        }

    }

    // Grow some roots and fungi

    // 80 25
    grid[80][25] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(80, 25, totalRootIndex++));
    grid[81][25] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(81, 25, false, totalFungiIndex++));
    

    // 80 75
    grid[80][75] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(80, 75, totalRootIndex++));
    grid[81][75] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(81, 75, false, totalFungiIndex++));


    // 80 90
    grid[80][90] = 'rootTip';
    elements.rootTip.rootElements.push(new RootTip(80, 90, totalRootIndex++));
    // grid[79][90] = 'fungi';
    // elements.fungi.fungiElements.push(new Fungi(79, 90, false, totalFungiIndex++));


    // 81 140
    grid[81][140] = 'fungi';
    elements.fungi.fungiElements.push(new Fungi(81, 140, false, totalFungiIndex++));
    


    // Call any other functions required to render the grid on the canvas.
}

function spawnLiquidSugarNearRoots() {
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === 'root' || grid[y][x] === 'rootTip') {
                // spawn liquid sugar randomly
                if (Math.random() < 0.0001) { 
                    // Spawn liquidSugar near root
                    const xOffset = Math.floor(Math.random() * 3) - 1; 
                    const yOffset = Math.floor(Math.random() * 3) - 1;
                    const newX = x + xOffset;
                    const newY = y + yOffset;

                    // Make sure new position is valid
                    if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight && grid[newY][newX] === 'soil') {
                        grid[newY][newX] = 'liquidSugar';
                    }
                }
            }
        }
    }
}

// Check for nearby liquid_sugar
function IfNearLiquidSugar(DISTANCE, y, x) {
    const directions = [
        {dy: -1, dx: 0},  // Up
        {dy: 1, dx: 0},  // Down
        {dy: 0, dx: -1}, // Left
        {dy: 0, dx: 1},  // Right
    ];

    for (let dy = -DISTANCE; dy <= DISTANCE; dy++) {
        for (let dx = -DISTANCE; dx <= DISTANCE; dx++) {
            if (y+dy >= 0 && y+dy < gridHeight && x+dx >= 0 && x+dx < gridWidth) {
                if (grid[y+dy][x+dx] === 'liquidSugar') {
                    const distance = Math.sqrt(dy*dy + dx*dx);
                    if (distance <= DISTANCE) {
                        
                        
                        
                        if (dy < 0) return{
                            ifNear:true,
                            priorityDirection: directions[0]
                        }; // Up
                        else if (dy > 0) return{
                            ifNear:true,
                            priorityDirection: directions[1]
                        }; // Down
                        if (dx < 0) return{
                            ifNear:true,
                            priorityDirection: directions[2]
                        }; // Left
                        else if (dx > 0) return{
                            ifNear:true,
                            priorityDirection: directions[3]
                        }; // Right
                        
                    }
                }
            }
        }
    }
    return{
        ifNear:false,
        priorityDirection: directions[0]
    };
}

function findBacteriaByPosition(bacteriaElements, x, y) {
    for (let bacteria of bacteriaElements) {
        if (bacteria.x === x && bacteria.y === y) {
            return bacteria;
        }
    }
    return null;  // Return null if no matching bacteria is found
}

function choseDirection(currentDirection, y, x) { //currentDirection is a integer
    const directions = [
        {dy: -1, dx: 0},  // Up
        {dy: 0, dx: -1}, // Left
        {dy: 1, dx: 0},  // Down
        {dy: 0, dx: 1},  // Right
    ];
   
    //return directions[Math.floor(Math.random() * directions.length)];
    let newDirectionIndex = Math.floor(Math.random() * directions.length);

    if(currentDirection ==null){
        bacteriaDirection[y][x] = directions[newDirectionIndex];
        return directions[newDirectionIndex];
    }


    let index = 0;
    directions.forEach((dir, idx) => {

        if (dir.dy === currentDirection.dy && dir.dx === currentDirection.dx) {
            //console.log(`Match found at index ${idx}`);
            index = idx;
        }
    });
    

    if(newDirectionIndex % 2 == index % 2){
        newDirectionIndex = (index + 1) % 4; 
    }

    //console.log("new direction", newDirectionIndex);
    bacteriaDirection[y][x] = directions[newDirectionIndex];
    return directions[newDirectionIndex];
        
}

function bacteriaMovement(newY, newX, y, x) {
    currBacteria = findBacteriaByPosition(elements.bacteria.bacteriaElements, x, y);
    
    //console.log(currBacteria instanceof Bacteria );
    try {
        if (newX < 0 || newY < 0 || newX >= gridWidth || newY >= gridHeight) {
            return; // Exit the function if out of bounds
        }
        
        let elementToRestore = currBacteria.bacteriaHistory(grid[newY][newX]);
        //console.log(grid[newY][newX])
        //console.log(elementToRestore);
        
        // Move the bacteria to the new cell
        grid[newY][newX] = 'bacteria';
        grid[y][x] = elementToRestore;

        currBacteria.updatePosition(newX, newY);
        
        processed[newY][newX] = true;
        bacteriaDirection[newY][newX] = chosenDirection;
        bacteriaDirection[y][x] = null;

        bacteriaIndex++;
        if (bacteriaIndex > totalBacteriaIndex){
            bacteriaIndex = 0;
        }
    } catch (error) {
        // If an error occurs, log it and return from the function
        console.error('An error occurred:', error.message);
        return;
    }
}

function generateBacterial() {
    //grid[129][20] = 'bacteria';
    
    for (let i = 0; i < 30; i++) {
        const randomX = Math.floor(Math.random() * gridWidth);
        const randomY = Math.floor(Math.random() * gridHeight);
        if (grid[randomY][randomX] == 'soil'){
            grid[randomY][randomX] = 'bacteria';
            // Change last constructor value to adjust lifespan of bacteria
            elements.bacteria.bacteriaElements.push(new Bacteria("#800080", 15, null, 0, [], randomX, randomY, 4000))
        //currBacteria.updatePosition(newY, newX);
        }
        


        //bacteriaIndex++;
        
    }
}

// Function to check and create micro-aggregates
function createMicroAggregates(testRadius, minBacteriaCount) {
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === 'bacteria') {
                const conditionsMet = checkMicroAggregateConditions(grid, x, y, testRadius, minBacteriaCount);
                if (conditionsMet) {
                    // Define the bounds of the search area
                    const minBoundX = Math.max(0, x - testRadius);
                    const maxBoundX = Math.min(gridWidth - 1, x + testRadius);
                    const minBoundY = Math.max(0, y - testRadius);
                    const maxBoundY = Math.min(gridHeight - 1, y + testRadius);

                    // Iterate over the search area and turn all 'soil' cells into 'aggregate'
                    for (let searchY = minBoundY; searchY <= maxBoundY; searchY++) {
                        for (let searchX = minBoundX; searchX <= maxBoundX; searchX++) {
                            // Check if the cell is within the ellipse
                            const dx = (searchX - x) / 5;
                            const dy = (searchY - y) / 3;
                            if (dx * dx + dy * dy <= 1 && grid[searchY][searchX] === 'soil') {
                                grid[searchY][searchX] = 'aggregate';
                            }
                        }
                    }
                }
            }
        }
    }
}

// Function to check conditions for micro-aggregate formation
function checkMicroAggregateConditions(grid, centerX, centerY, testRadius, minBacteriaCount) {
    const minBoundX = Math.max(0, centerX - testRadius);
    const maxBoundX = Math.min(gridWidth - 1, centerX + testRadius);
    const minBoundY = Math.max(0, centerY - testRadius);
    const maxBoundY = Math.min(gridHeight - 1, centerY + testRadius);
    let bacteriaCount = 0;
    let aggregateCount = 0;
    for (let y = minBoundY; y <= maxBoundY; y++) {
        for (let x = minBoundX; x <= maxBoundX; x++) {
            if (grid[y][x] === 'bacteria') {
                bacteriaCount++;
            }
            if (grid[y][x] === 'aggregate') {
                aggregateCount++;
            }
        }
    }
    // Adjust these conditions as needed
    return bacteriaCount >= minBacteriaCount && aggregateCount === 0;
}

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

function loop() {
    const testRadiusMicro = 5;
    const minBacteriaCount = 2;
    updateGrid();
    drawGrid();
    createMicroAggregates(testRadiusMicro, minBacteriaCount);
    spawnLiquidSugarNearRoots(); 
    requestAnimationFrame(loop);
    timeStep++;
    timeMove++;
    elements.bacteria.bacteriaElements.forEach((bacteria, index) => {
        bacteria.decreaseLifespan();
        if (bacteria.lifespan <= 0) {
            // Bacteria dies out
            grid[bacteria.y][bacteria.x] = 'soil';
            elements.bacteria.bacteriaElements.splice(index, 1);
        }
    });
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

window.addEventListener('load', function () {
    // Logic to draw sand on the canvas automatically
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    loop();
    drawAutomatically();
    generateBacterial();
});