import RootStructure from '../root/root.js';
import { grid } from '../sandSim.js';
import { currentParticleType } from '../sandSim.js';
import { rootIndex } from '../sandSim.js';
import { totalRootIndex } from '../sandSim.js';
import { totalFungiIndex } from '../sandSim.js';
import { fungiIndex } from '../sandSim.js';
import { incrementTotalFungiIndex, decrementTotalFungiIndex } from '../sandSim.js';
import { elements } from '../sandSim.js';
import { timeStep } from '../sandSim.js';
import { gridWidth, gridHeight } from '../sandSim.js';


export default class Fungi extends RootStructure {
    // Fungi will first start at a location and branch out normally like rootTip
    // It will then find the nearest rootTip and do 1 singular branch to it while still branching out normally
    constructor(startingY, startingX, branchingToRoot, index) {
        if (branchingToRoot == true) {
            super(startingY, startingX, 50, 700, 'fungi', 300, index);
        }
        else {
            super(startingY, startingX, 70, 400, 'fungi', 1000, index);
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
        this.branchCount = 8;
        // Spacing from other fungi branches
        this.spacing = 1;
        // Amount of times it stayed on same horizontal and vertical in a row
        this.countX = 0;
        this.countY = 0;
        // Amount of times diagonal
        this.countDiag = 0;
        // Branching probability
        this.branchProb = 0.85;
        this.parentRoot = null;
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
                    decrementTotalFungiIndex(totalFungiIndex - 1);
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
        if (y > gridHeight - this.spacing - 1 || y < 80 + this.spacing + 1 || x < 0 + this.spacing + 1 || x > gridWidth - this.spacing - 1) {
            return false;
        }
        // Loops through one above, one below, to spacing
        for (let spaceY = -1; spaceY <= this.spacing; spaceY++) {
            for (let spaceX = -1; spaceX <= this.spacing; spaceX++) {
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
        // 1, 2, 3
        if (this.length / this.maxGrowthLength > 0.75) {
            this.spacing = 2;
        }
        /*        else if (this.spacing / this.maxGrowthLength > 0.7) {
                    this.spacing = 3;
                }*/
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
        if (this.countY >= 2 || (this.countX > 0 && this.countX != 2)) {
            growOptions.splice(2, 1);
        }

        // Don't grow horizontally, been growing horizontally for 2 pixels or just grew vertically
        else if (this.countX >= 2 || (this.countY > 0 && this.countY != 2)) {
            growOptions.splice(1, 1);
        }
        // Don't grow diagonally
        else if (this.countDiag >= 4) {
            growOptions.splice(0, 1);
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
            // Remove from parent root array
            this.parentRoot.parentFungi.splice(this.parentRoot.parentFungi.indexOf(this), 1);
            elements.fungi.fungiElements.splice(this.index, 1);
            decrementTotalFungiIndex(totalFungiIndex - 1);
            // Update the index of all the fungiElements above it
            for (let i = this.index; i < totalFungiIndex; i++) {
                elements.fungi.fungiElements[i].index = i;
            }
            return false;
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
        else if (this.countDiag == 4) {
            this.countDiag = 0;
        }
        // Growing vertical
        if (finalGrowX == 0 && finalGrowY == this.expandYDir) {
            this.countY++;
        }
        // Growing horizontal
        else if (finalGrowY == 0 && finalGrowX == this.expandXDir) {
            this.countX++;
        }
        // Growing diagonally
        else if (finalGrowY != 0 && finalGrowX != 0) {
            this.countDiag++;
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
                let branchFungi = new Fungi(newY, newX, false, totalFungiIndex);
                incrementTotalFungiIndex(totalFungiIndex + 1);
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
                //console.log(branchFungi.growthSpeed, branchFungi, "branch fungi");
                // Add it to root tip array
                branchFungi.parentRoot = this.parentRoot;
                this.parentRoot.parentFungi.push(branchFungi);
                // Add to general fungi array
                elements.fungi.fungiElements.push(branchFungi);
                grid[branchFungi.y][branchFungi.x] = 'fungi';
                this.branchProb = 0.5;
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
        //console.log(this.growthSpeed, timeStep, "FUNGI BEFORE SPEED", Math.round(1.3 * this.growthSpeed));
        this.updateGrowthSpeed();
        /* If below 5000 timeSteps, grow every 500 timeSteps max
        /* If 5000 - 15000 timeSteps, grow every 800 timeSteps max
        /* If >15000, grow every 1500 timesteps max
        if (timeStep < 5000) {
            this.growthSpeed = Math.round(this.growthSpeed * 1.3);
            if (timeStep - this.growthSpeed > 500) {
                this.growthSpeed = timeStep + 500;
            }
        }
        else if (timeStep >= 5000 && timeStep < 15000) {
            this.growthSpeed = Math.round(this.growthSpeed * 1.2);
            if (timeStep - this.growthSpeed > 700) {
                this.growthSpeed = timeStep + 700;
            }
        }
        else {
            this.growthSpeed = Math.round(this.growthSpeed * 1.1);
            if (timeStep - this.growthSpeed > 1000) {
                this.growthSpeed = timeStep + 1000;
            }
        }
/*        if (this.length >= 25) {
            this.growthSpeed = Math.round(this.growthSpeed * 1.3);
        }
        else {
            this.growthSpeed = Math.round(this.growthSpeed * 1.1);
        }
        if (timeStep >= 5000 && this.growthSpeed > 1.1 * timeStep) {
            this.growthSpeed = Math.round(1.1 * timeStep);
        }
        else if (timeStep < 5000 && this.growthSpeed > 1.5 * timeStep) {
            this.growthSpeed = Math.round(1.5 * timeStep);
        }*/
        this.updateSpacing();
        //console.log("UPDATED VALUES", this.growthSpeed, this.spacing, this.length, totalFungiIndex);


    }
}