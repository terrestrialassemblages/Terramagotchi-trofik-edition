import RootStructure from '../root/root.js';
import { grid, canvas, globalY, TIMESCALE} from '../sandSim.js';
import { currentParticleType } from '../sandSim.js';
import { elements } from '../sandSim.js';
import { timeStep } from '../sandSim.js';
import { gridWidth, gridHeight } from '../sandSim.js';
import { totalFungiIndex, decrementTotalFungiIndex } from '../sandSim.js';




export default class Fungi extends RootStructure {
    

    // Fungi will first start at a location and branch out normally like rootTip
    // It will then find the nearest rootTip and do 1 singular branch to it while still branching out normally
    constructor(startingY, startingX, branchingToRoot, index) {
        super(startingY, startingX, 90, Math.round(400 * TIMESCALE), 'fungi', 0.9, index);
        this.forbElements = ['fungi'];
        // Remaining branch counts
        this.branchCount = 25;
        // Max cap for speed
        this.growthSpeedLimit = Math.round(1800 * TIMESCALE);
        this.boundaryXWithOtherFungi = null;
        this.parentRoot = null;
        this.regrow = false;

    }

    calculateBoundary(firstFungiX, secondFungiX) {
        this.boundaryXWithOtherFungi = Math.round((firstFungiX + secondFungiX) / 2);
    }

    updateSpacing() {
        // Spacing makes it more spread out
        if (this.length / this.maxGrowthLength > 0.75) {
            this.spacing = 2;
        }
    }

    remove() {
        elements.fungi.fungiElements.splice(this.index, 1);
        if (this.parentRoot != null) {
            // Remove from parent root array
            this.parentRoot.parentFungi.splice(this.parentRoot.parentFungi.indexOf(this), 1);
        }
        decrementTotalFungiIndex(totalFungiIndex - 1);
        // Update the index of all the fungiElements above it
        for (let i = this.index; i < totalFungiIndex; i++) {
            elements.fungi.fungiElements[i].index = i;
        }
    }

}