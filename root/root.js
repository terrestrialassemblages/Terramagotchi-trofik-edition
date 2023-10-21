import { grid, topGrid } from '../sandSim.js';
import Plant from '../plant/plant.js';
import { timeStep, globalY } from '../sandSim.js';
import { incrementTotalFungiIndex, decrementTotalFungiIndex, incrementTotalRootIndex, decrementTotalRootIndex } from '../sandSim.js';
import { gridWidth, gridHeight } from '../sandSim.js';
import { rootIndex } from '../sandSim.js';
import { totalRootIndex } from '../sandSim.js';
import { totalFungiIndex } from '../sandSim.js';
import { fungiIndex } from '../sandSim.js';
import { elements } from '../sandSim.js';
import { sunValue } from '../weather.js';


export default class RootStructure {
    constructor(startingY, startingX, growthLimit, growthSpeed, elementName, branchProb, index) {
        this.startingY = startingY;
        this.startingX = startingX;
        this.y = startingY;
        this.x = startingX;
        this.index = index;        // Reference it in the list of roots
        this.growthSpeed = growthSpeed;         // Every growthSpeed number of time steps, it will grow (Higher growthSpeed means it grows slower)
        this.maxGrowthLength = growthLimit;
        this.length = 1;
        this.elementName = elementName;
        this.branchProb = branchProb;
        this.nutrientBoosted = false;
        this.plant = new Plant(this.startingY, this.startingX, this);
        // X and Y direction that the branch will grow
        this.expandXDir = Math.random() < 0.5 ? -1 : 1;
        this.expandYDir = 1;
        // Spacing from other branches
        this.spacing = 1;
        // Amount of times it stayed on same horizontal and vertical in a row
        this.countX = 0;
        this.countY = 0;
        // Amount of times diagonal
        this.countDiag = 0;
        // Boost value that will adjust growth speed, affected by sun and water, mainly for plant root
        this.boostValue = 1;
    }

    // Determines if root should grow or not
    growBool(totalIndex) {
        /*        try {*/
        // If root is at max size, stop growing
        if (this.length >= this.maxGrowthLength && this.elementName == 'rootTip') {
            // Mark the root as Developed
            this.developed = true;
        }
        if ((timeStep >= this.growthSpeed) && this.developed == true && this.elementName == 'rootTip') {
            // If root is developed, produce sugar
            this.produceSugar();
            return ([false, totalIndex]);
        }
        return ([(timeStep >= this.growthSpeed) && (this.length < this.maxGrowthLength), (totalIndex)]);
        /*        } catch (error) {
                    // If an error occurs, log it and return from the function
                    console.error('An error occurred:', error.message);
                    return;
                }*/
    }

    // Adjusts the growth speed depending on the current length
    updateGrowthSpeed() {
        // Growth speed scaled according to difference in length from maxGrowthLength
        // this.growthSpeed += Math.ceil(this.startingSpeed / (this.maxGrowthLength / 1 + this.length));
        // Have tos cale it to1
        //let baseIncrement = 1 + ((this.maxGrowthLength - this.length) / this.maxGrowthLength);
        let baseIncrement = 1 + (1 - (Math.abs(this.length - this.maxGrowthLength)) / this.maxGrowthLength);
        baseIncrement = Math.max(1.05, baseIncrement + 1 - this.boostValue);
        let speedCap = 0;
        if (this.length <= 20) {
            speedCap = Math.round(this.growthSpeedLimit * 0.5);
        }
        else if (this.length > 20 && this.length <= 40) {
            speedCap = Math.round(this.growthSpeedLimit * 0.75);
        }
        else {
            speedCap = this.growthSpeedLimit;
        }
        // Introduce variability in speed for fungi
        if (speedCap >= 900) {
            // Generate random speedCap between 75% and 100%
            speedCap = Math.round(Math.random() * (speedCap - (0.75 * speedCap)) + (0.75 * speedCap));
        }
        // If it stopped growing for a long time (ie root waiting for sugar to be eaten) and growthSpeed is very behind compared to timeStep, update with timeStep
        if (timeStep > this.growthSpeed) {
            this.growthSpeed = timeStep + (speedCap * this.boostValue);
        }
        else {
            this.growthSpeed = Math.min((Math.round(baseIncrement * this.growthSpeed)), this.growthSpeed + (speedCap * this.boostValue));
            this.growthSpeed = Math.round(this.growthSpeed);
        }
    }

    checkSurroundingForElement(y, x, element) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (y + i < gridHeight - 1 && y - i > globalY + 1 && x + j < gridWidth - 1 && x - j > 0 + 1) {
                    if (grid[y + i][x + j] == element) {
                        if (element == 'water') {
                            console.log("Removing water");
                            topGrid[y + i][x + j] = null;
                        }
                        return true;
                    }

                }
            }
        }
        return false;
    }

    resetCounters(finalGrowY, finalGrowX) {
        // Growing vertical
        if (finalGrowX == 0 && finalGrowY == this.expandYDir) {
            this.countY++;
            // Reset other counters
            this.countX = 0;
            this.countDiag = 0;
        }
        // Growing horizontal
        else if (finalGrowY == 0 && finalGrowX == this.expandXDir) {
            this.countX++;
            // Reset other counters
            this.countY = 0;
            this.countDiag = 0;
        }
        // Growing diagonally
        else if (finalGrowY != 0 && finalGrowX != 0) {
            this.countDiag++;
            // Reset other counters
            this.countY = 0;
            this.countX = 0;
        }
    }

    findGrowDir(growOptions, expandYDir, expandXDir, isFungi, forbElements) {
        // Create copy of array so changes are not made to the actual growOptions
/*        let growOptions = growOptionsPar.slice();
*/      let finalGrowDir = null;
        // Loops if there are still options and a final direction is not found yet
        while (finalGrowDir == null && growOptions.length != 0) {
            let growIndex = Math.floor(Math.random() * (growOptions.length));
            // Encourage plant root tips to grow vertically down instead of out
            if (!isFungi && growOptions.length == 3 || growOptions.length == 2) {
                if (this.length < 5) {
                    growIndex = 0;
                }
                else {
                    growIndex = Math.round(Math.random());
                }
            }
            // Encourage fungi to grow out in the beginning
            if (isFungi && growOptions.length == 3 && this.length < 5) {
                growIndex = Math.random() < 0.5 ? 0 : 2;
            }
            let testY = this.y;
            let testX = this.x;
            testY += growOptions[growIndex][0];
            testX += growOptions[growIndex][1];
            // Check grow direction
            if (this.canGrow(testY, testX, expandYDir, expandXDir, isFungi, forbElements)) {
                finalGrowDir = growOptions[growIndex];
                return finalGrowDir;
            }
            else {
                // Remove the option
                growOptions.splice(growIndex, 1);
            }
        }
        return false;
    }
    // Should check 1 to right as well when going diagonal
    canGrow(y, x, yDir, xDir, isFungi, forbElements) {
        let count = 0;
        // If exceeds boundaries
        if (y > gridHeight - 1 || y < globalY || x < 0 + 1 || x > gridWidth - 1) {
            return false;
        }

        // Loops through one above, one below, to spacing
        for (let spaceY = -1; spaceY <= this.spacing; spaceY++) {
            for (let spaceX = -1; spaceX <= this.spacing; spaceX++) {
                let newY = y + (yDir * spaceY);
                let newX = x + (xDir * spaceX);
                // Exceeded boundary. Stil grow as long as current location is not exceeding boundaries but this will mean future growth is limited
                if (newY > gridHeight - 1 || newY < globalY + 1 || newX > gridWidth - 1 || newX < 0 + 1) {
                    continue;
                }
                // Lets it reconnect with other fungi
                if (isFungi && this.regrow == true) {
                    if (grid[newY][newX] == 'fungi' && spaceX > 0  && count < 1) {
                        console.log("Found fungi near");
                        count++;
                        continue;
                    }
                }
                else {
                    for (let element of forbElements) {
                        // Nearby is a forbidden element
                        if (grid[newY][newX] == element) {
                            // canGrow is called at the location that we want to grow in, so it could be checking the original location
                            if (element == grid[this.y][this.x] && (newY == this.y && newX == this.x)) {
                                continue;
                            }
                            // Get a pass even if it is another fungi to encourage cellular automata
                            // (this.length / this.maxGrowthLength >= 0.5
                            else if (isFungi == true && element == 'fungi' && this.boundaryXWithOtherFungi != null && spaceX > 0 && count < 1) {
                                // In the boundary with other fungi object and is growing horizontally
                                if ((this.expandXDir == -1 && x < this.boundaryXWithOtherFungi) || (this.expandXDir == 1 && x > this.boundaryXWithOtherFungi)) {
                                    console.log("Boundary exception");
                                    count++;
                                    continue;
                                }
                            }
                            return false;
                        }
                    }
                }
            }
        }
        if (isFungi == false) {
            // Check for aggregates
            if (this.canAvoidAggregates(y, x, 0)) {
                return true;
            }
            return false;
        }
        return true;
    }

    // Fuction to grow root object (fungi and rootTip) by one block
    expandRoot(elementsArray, isFungi) {
        //console.log("EXPANDING FUNGI NOW", this.index, totalFungiIndex, totalIndex, this.countY, this.countX);
        let remove = false;
        let finalGrowDir = null;
        let growIndex = null;
        let branchRoot = null;

        // Boost the fungi's growth once it has been attached to the plant root
        if (this.branchElement != null && this.branchElement.attached == true && this.nutrientBoosted == false) {
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
        let growOptions = [[this.expandYDir, this.expandXDir], [this.expandYDir, 0], [0, this.expandXDir]];

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

        // Resetting maxed out counters, can't go in same direction again and would have been removed if no valid options
        if (this.countY == 3) {
            this.countY = 0;
        }
        else if (this.countX == 2) {
            this.countX = 0;
        }
        else if (this.countDiag == 4) {
            this.countDiag = 0;
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

        finalGrowDir = this.findGrowDir(growOptions, this.expandYDir, this.expandXDir, isFungi, this.forbElements);

        if (finalGrowDir == false) {
            // Try last exception (grow sideways up)
            if (this.canGrow(this.y - 1, this.x + this.expandXDir, -1, this.expandXDir, isFungi, this.forbElements)) {
                finalGrowDir = [-1, this.expandXDir];
                this.expandYDir = -1;
                // Limit upward growth
                this.maxGrowthLength = this.length + 3;
            }
            else {
                remove = true;
            }
        }

        // No valid grow directions, so remove from fungiElements
        if (remove == true) {
            this.remove();
            return false;
        }

        let finalGrowY = finalGrowDir[0];
        let finalGrowX = finalGrowDir[1];

        this.resetCounters(finalGrowY, finalGrowX);

        // If shouldBranch and the current branch can has space to grow
        if (this.branchCount > 0 && shouldBranch) {
            let newX = this.x - this.expandXDir;
            let newY = this.y;
            let newXDir = -(this.expandXDir);
            let newYDir = this.expandYDir;
            // If original root object grows horizontal, branch grows vertical
            if (finalGrowY == 0 && finalGrowX == this.expandXDir) {
                newY = this.y + 1;
                //console.log("BRANCING DOWN");
            }
            // If original root object grows vertical (both up and down), branch goes horizontal which is already set for newX
            // If going diagonal, branch the other diagonal
            else if (finalGrowX == this.expandXDir && finalGrowY == this.expandYDir) {
                newY = this.y + 1;
            }

            // Checking if it can grow for new branch values
            if (this.canGrow(newY, newX, newYDir, newXDir, isFungi, this.forbElements)) {
                // Set branch root to the new parameters to be returned
                branchRoot = [newY, newX, newYDir, newXDir];
            }
            else {
                // Increase probability for next time
                this.branchProb += 0.02;
            }
        }
        else {
            // Increase changes of branching
            this.brancProb += 0.02;
        }

        if (!isFungi) {
            grid[this.y][this.x] = 'root';
        }

        // Update this object's y and x values
        this.y += finalGrowY;
        this.x += finalGrowX;

        // If regrown fungi and there is already an adjacent fungi, set regrow to false to prevent messy fungi as it will allow more exceptions to be adjacent
        if (isFungi && this.regrow == true) {
            if (this.checkSurroundingForElement(this.y, this.x, 'fungi') == true) {
                this.regrow = false;
            }
        }

        // If not root or root tip, grow over it
        //  && grid[this.y][this.x] != 'aggregate' to avoid aggregate but looks weird
        if (isFungi && grid[this.y][this.x] != 'root' && grid[this.y][this.x] != 'rootTip') {
            grid[this.y][this.x] = 'fungi';
        }
        if (!isFungi) {
            grid[this.y][this.x] = 'rootTip';
        }
        this.length++;
        // If root or root tip, just go under it by not changing grid to fungi
        // Update growth speed
        this.updateGrowthSpeed();

        return (branchRoot);
    }
}