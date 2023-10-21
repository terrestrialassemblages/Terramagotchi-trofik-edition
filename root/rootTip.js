import RootStructure from './root.js';
import { gridWidth, gridHeight } from '../sandSim.js';
import { timeStep, globalY, elements } from '../sandSim.js';
import { grid, topGrid, canvas } from '../sandSim.js';
import { totalRootIndex, decrementTotalRootIndex } from '../sandSim.js';


export default class RootTip extends RootStructure {
    constructor(startingY, startingX, fungiParent, index) {
        super(startingY, startingX, 4, 500, 'rootTip', 1, index);
        this.parentFungi = new Array();
        this.parentFungi.push(fungiParent);
        this.developed = false;    // If root is not developed, it will grow. If fully developed, it will produce sugar instead of growing
        this.forbElements = ['root', 'rootTip'];
        // Remaining branch counts
        this.branchCount = 5;
        // Max cap for speed
        this.growthSpeedLimit = 2200;

        //console.log(this.parentFungi);
    }

    canAvoidAggregates(y, x, checkedLength) {
        /* Check diagonally down (both left and right), and vertically down
        As long as not all 3 are forbElements, recursively check again for the cell that is not a forbElement until checkedLength is 3
        If those don't work, then move horizontally
        checkedLength is a counter of path length and when it is 3, stop */
        let finalGrowBool = false;
        // If it is an aggregate
        if (checkedLength == 0) {
            if (grid[y][x] == 'aggregate') {
                return false;
            }
        }
        if (checkedLength >= 3) {
            return true;
        }
        // Check future path to see if there is a path

        // Check boundaries as it will also be checking the 3 blocks below it 
        if (y > gridHeight - 2 || y < globalY || x > gridWidth - 2 || x < 0 + 2) {
            // Already grew at least once and it reached the boundary after which is still valid
            if (checkedLength > 0) {
                return true;
            }
            return false;
        }

        // Check diagonally downwards and directly downwards
        let newY = y + 1;
        for (let spaceX = -1; spaceX <= 1; spaceX++) {
            let newX = x + spaceX;
            if (grid[newY][newX] != 'aggregate') {
                // Check if it can further grow in that cell
                finalGrowBool = finalGrowBool || this.canAvoidAggregates(newY, newX, checkedLength + 1);
            }
        }
        return finalGrowBool;


    }

    // Function to produce 1 block of liquid sugar from root tip
    produceSugar() {
        if (grid[this.y][this.x] == 'rootTip') {
            // If the block below is soil or fungi, produce liquid sugar
            if (grid[this.y + 1][this.x] === 'soil' || grid[this.y + 1][this.x] === 'fungi') {
                topGrid[this.y + 1][this.x] = 'liquidSugar';
            }
            // Check at the sides instead
            else if (grid[this.y][this.x + this.expandXDir] == 'soil' || grid[this.y][this.x + this.expandXDir] == 'fungi') {
                topGrid[this.y][this.x + this.expandXDir] = 'liquidSugar';
            }
            else if (grid[this.y][this.x - this.expandXDir] == 'soil' || grid[this.y][this.x - this.expandXDir] == 'fungi') {
                topGrid[this.y][this.x - this.expandXDir] = 'liquidSugar';
            }
            else {
                // Let it continue growing to free up some more space
                this.developed = false;
                this.maxGrowthLength++;
            }
        }
    }

    // Function to check if liquid sugar has been eaten. If yes, allows root to grow larger
    sugarEaten() {
        if (this.developed == true && grid[this.y + 1][this.x] == 'bacteria') {
            // Increase max length of rootTip
            this.developed = false;
            this.maxGrowthLength += 2;
/*            for (let i = 0; i < this.parentFungi.length; i++) {
                this.parentFungi[i].expandRoot(elements.fungi.fungiElements, true);
            }*/
            // this.growthSpeed = Math.round(this.growthSpeed * (2 / 3));
            //console.log("SUGAR EATEN, INCREASING LENGTH FOR ROOT: ", this.index);
        }
    }

    remove() {
        elements.rootTip.rootElements.splice(this.index, 1);
        decrementTotalRootIndex(totalRootIndex - 1);
        // Update the index of all the rootElements above it
        for (let i = this.index; i < totalRootIndex; i++) {
            elements.rootTip.rootElements[i].index = i;
        }

    }
}