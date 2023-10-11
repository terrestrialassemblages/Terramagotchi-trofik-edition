import RootTip from '../sandSim.js';
import { grid } from '../sandSim.js';

import { timeStep, gridWidth, gridHeight } from '../sandSim.js';


export default class RootStructure {
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
        try{
            // If root is at max size, stop growing
            if (this.length >= this.maxGrowthLength) {
                // Mark the root as Developed
                this.developed = true;
            }
            if ((timeStep >= this.growthSpeed) && this.developed == true && this.elementName == 'rootTip') {
                // If root is developed, produce sugar
                this.produceSugar();
                //console.log("FULLY GROWN, PRODUCING SUGAR");
                return ([false, totalIndex]);
            }
            return ([(timeStep >= this.growthSpeed) && (this.length < this.maxGrowthLength), (totalIndex)]);
        } catch (error) {
            // If an error occurs, log it and return from the function
            console.error('An error occurred:', error.message);
            return;
        }
    }

    // Adjusts the growth speed depending on the current length
    updateGrowthSpeed() {
        // Growth speed scaled according to difference in length from maxGrowthLength
        // this.growthSpeed += Math.ceil(this.startingSpeed / (this.maxGrowthLength / 1 + this.length));
        // Have tos cale it to1
        //let baseIncrement = 1 + ((this.maxGrowthLength - this.length) / this.maxGrowthLength);
        let baseIncrement = 1 + (1 - (Math.abs(this.length - this.maxGrowthLength)) / this.maxGrowthLength);
        baseIncrement = Math.max(1.05, baseIncrement);
        let speedCap = 0;
        if (this.length <= 20) {
            speedCap = 500;
        }
        else if (this.length > 20 && this.length <= 40) {
            speedCap = 900;
        }
        else {
            speedCap = 1200;
        }
        // Introduce variability in speed for fungi
        if (speedCap >= 900) {
            // Generate random speedCap between 75% and 100%
            speedCap = Math.round(Math.random() * (speedCap - (0.75 * speedCap)) + (0.75 * speedCap));
        }
        if (timeStep > this.growthSpeed) {
            this.growthSpeed = timeStep + speedCap;
        }
        else {
            this.growthSpeed = Math.min((Math.round(baseIncrement * this.growthSpeed)), this.growthSpeed + speedCap);
        }
    }

    // Should check 1 to right as well when going diagonal
    canGrow(y, x, yDir, xDir, forbElements) {
        // If exceeds boundaries
        if (y > gridHeight - 1 || y < 80 + 1 || x < 0 + 1 || x > gridWidth - 1) {
            return false;
        }
        // Loops through one above, one below, to spacing
        for (let spaceY = -1; spaceY <= this.spacing; spaceY++) {
            for (let spaceX = -1; spaceX <= this.spacing; spaceX++) {
                if (y + (yDir * spaceY) > gridHeight - 1 || y + (yDir * spaceY) < 80 + 1 || x + (xDir * spaceX) > gridWidth - 1 || x + (xDir * spaceX) < 0 + 1) {
                    continue;
                }
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

    findGrowDir(growOptions, expandYDir, expandXDir, forbElements) {
        let finalGrowDir = null;
        while (finalGrowDir == null && growOptions.length != 0) {
            if (forbElements.length == 3) {
                console.log("TRYING NOW2");
            }
            let growIndex = Math.floor(Math.random() * (growOptions.length));
            let testY = this.y;
            let testX = this.x;
            testY += growOptions[growIndex][0];
            testX += growOptions[growIndex][1];
            if (forbElements.length == 3) {
                console.log(growOptions[growIndex], testY, testX);
            }
            // Check grow direction
            if (this.canGrow(testY, testX, expandYDir, expandXDir, forbElements)) {
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


    // Fuction to grow root by one block
    expandRoot(elementsArray, index, totalIndex) {
        //console.log("EXPANDING ROOT NOW NO: ", this.index);
        let forbElements = ['aggregate', 'root', 'rootTip'];
        // Prioritise growing downwards so vertically down or diagonally
        let growOptions = [[1, 0], [1, 1], [1, -1]];
        if (this.length == 1) {
            growOptions = [[1, 1], [1, -1]];
        }
        // Randomly choose -1 or 1 for x growth direction 
        let x_direction = Math.random() < 0.5 ? -1 : 1;


        // Try with random x_direction
        let finalGrowDir = this.findGrowDir(growOptions, 1, x_direction, forbElements);
        // Can't grow in that x_direction
        if (finalGrowDir == false) {
            console.log("FAIL1");
            finalGrowDir = this.findGrowDir(growOptions, 1, -x_direction, forbElements);
            // Can't grow vertically down or diagonally down so check sideways
            if (finalGrowDir == false) {
                // Try grow sideways
                console.log("FAIL2");
                growOptions = [[0, x_direction]];
                finalGrowDir = this.findGrowDir(growOptions, 1, x_direction, forbElements);
                if (finalGrowDir == false) {
                    console.log("FAIL3");
                    // Try growing the other way
                    growOptions = [[0, -x_direction]];
                    finalGrowDir = this.findGrowDir(growOptions, 1, -x_direction, forbElements);
                    if (finalGrowDir == false) {
                        console.log("FAIL4");
                        // Remove from parent root array
                        elementsArray.splice(this.index, 1);
                        totalIndex--;
                        // Update the index of all the fungiElements above it
                        for (let i = this.index; i < totalIndex; i++) {
                            elementsArray[i].index = i;
                        }
                        return false;
                    }
                }

            }
        }
        // Have a valid grow direction
        let finalGrowY = finalGrowDir[0];
        let finalGrowX = finalGrowDir[1];
        // Set initial values
        let rootTipBool = true;
        let prob = 0.2;

        // Set the probability to branch into 2 roots
        let shouldBranch = Math.random() < prob;

        // If shouldBranch is true, and there is enough space to grow, grow an additional branch in the bottom right direction
        if (shouldBranch && grid[this.y + finalGrowY][this.x - finalGrowX] == 'soil') {

            // Create a new rootTip object for new branch
            grid[this.y + finalGrowY][this.x - finalGrowX] = 'rootTip';
            let branchRootTip = new RootTip(this.y + finalGrowY, this.x + finalGrowX, this.parentFungi, totalIndex++);
            branchRootTip.parentFungi = this.parentFungi;
            branchRootTip.length = this.length + 2;
            branchRootTip.maxGrowthLength = this.maxGrowthLength;
            elementsArray.push(branchRootTip);

            // Produce sugar at branching point
            this.produceSugar();
            //console.log("BRANCHING, PRODUCE SUGAR");

        }
        // Update Current rootTip object
        grid[this.y][this.x] = 'root';
        this.length += 2;
        this.y += finalGrowY;
        this.x += finalGrowX;
        grid[this.y][this.x] = 'rootTip';
        this.updateGrowthSpeed();
        return totalIndex;
    }
}