import RootTip from './sandSim.js';
import { grid } from './sandSim.js';

import { currentParticleType } from './sandSim.js';
import { timeStep } from './sandSim.js';
import { rootIndex } from './sandSim.js';
import { totalRootIndex } from './sandSim.js';
import { fungiIndex } from './sandSim.js';
import { totalFungiIndex } from './sandSim.js';

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
        // If root is at max size, stop growing
        if (this.length >= this.maxGrowthLength) {
            // Mark the root as Developed
            this.developed = true;
        }
        if ((timeStep % this.growthSpeed == 0) && this.developed == true && this.elementName == 'rootTip') {
            // If root is developed, produce sugar
            this.produceSugar();
            //console.log("FULLY GROWN, PRODUCING SUGAR");
            return ([false, totalIndex]);
        }
        return ([(timeStep % this.growthSpeed == 0) && (this.length < this.maxGrowthLength), (totalIndex)]);
    }

    // Adjusts the growth speed depending on the current length
    updateGrowthSpeed() {
        // Pythagoras from starting location
        // let distance = Math.sqrt(Math.pow(Math.abs(this.y - this.startingY), 2) + (Math.pow(Math.abs(this.x - this.startingX), 2)));
        // Growth speed scaled according to difference in length from maxGrowthLength
        this.growthSpeed += Math.ceil(this.startingSpeed / (this.maxGrowthLength / 1 + this.length));
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

    // Fuction to grow root by one block
    expandRoot(elementsArray, index, totalIndex) {

        //console.log("EXPANDING ROOT NOW NO: ", this.index);

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
            branchRootTip.parentFungi = this.parentFungi;
            branchRootTip.length = this.length + 2;
            elementsArray.push(branchRootTip);

            // Produce sugar at branching point
            this.produceSugar();
            //console.log("BRANCHING, PRODUCE SUGAR");

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