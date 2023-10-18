import RootStructure from '../root/root.js';
import { grid, canvas } from '../sandSim.js';
import { currentParticleType } from '../sandSim.js';
import { elements } from '../sandSim.js';
import { timeStep } from '../sandSim.js';


export default class Fungi extends RootStructure {
    

    // Fungi will first start at a location and branch out normally like rootTip
    // It will then find the nearest rootTip and do 1 singular branch to it while still branching out normally
    constructor(startingY, startingX, branchingToRoot, index) {
        super(startingY, startingX, 70, 400, 'fungi', 1000, 0.9, index);
        this.forbElements = ['fungi'];
        // Remaining branch counts
        this.branchCount = 25;
        // Max cap for speed
        this.growthSpeedLimit = 1800;
        this.boundaryXWithOtherFungi = null;

    }

    calculateBoundary(firstFungiX, secondFungiX) {
        this.boundaryXWithOtherFungi = Math.round((firstFungiX + secondFungiX) / 2);
    }

    updateSpacing() {
        // 1, 2, 3
        if (this.length / this.maxGrowthLength > 0.75) {
            this.spacing = 2;
        }
    }

}