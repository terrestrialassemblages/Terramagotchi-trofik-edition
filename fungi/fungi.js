import RootStructure from '../root/root.js';
import { grid, canvas } from '../sandSim.js';
import { currentParticleType } from '../sandSim.js';
import { elements } from '../sandSim.js';
import { timeStep } from '../sandSim.js';


export default class Fungi extends RootStructure {
    

    // Fungi will first start at a location and branch out normally like rootTip
    // It will then find the nearest rootTip and do 1 singular branch to it while still branching out normally
    constructor(startingY, startingX, branchingToRoot, index) {
        if (branchingToRoot == true) {
            super(startingY, startingX, 50, 700, 'fungi', 300, 0.9, index);
        }
        else {
            super(startingY, startingX, 70, 400, 'fungi', 1000, 0.9, index);
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
        this.parentRoot = null;
        this.forbElements = ['fungi'];
        // Remaining branch counts
        this.branchCount = 15;
        // Max cap for speed
        this.growthSpeedLimit = 1800;

    }

    updateSpacing() {
        // 1, 2, 3
        if (this.length / this.maxGrowthLength > 0.75) {
            this.spacing = 2;
        }
    }

}