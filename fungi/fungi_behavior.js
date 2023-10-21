import Fungi from './fungi.js';
import { totalFungiIndex, fungiIndex, IncrementFungiIndex, DecrementFungiIndex, resetFungiIndex } from '../sandSim.js';
import { incrementTotalFungiIndex,  decrementTotalFungiIndex} from '../sandSim.js';
import { elements } from '../sandSim.js';


export function fungiBehavior(y, x, grid) {
    if (totalFungiIndex > 0) {
        try {
            if (fungiIndex >= totalFungiIndex) {
                console.log('An error occured with fungiIndex: ', fungiIndex, totalFungiIndex, elements.fungi.fungiElements, this);
                DecrementFungiIndex(0);
            }
            let curr = elements[grid[y][x]].fungiElements[fungiIndex];

            // Check for water
            if (curr.checkSurroundingForElement(curr.y, curr.x, 'water')) {
                // Cap min to 0.5
                curr.parentRoot.boostValue = Math.max(curr.parentRoot.boostValue - 0.1, 0.5);
                console.log("New boostValue", curr.parentRoot.boostValue);

            }

            // If root is not at max size, expand root
            let result = curr.growBool(totalFungiIndex);
            incrementTotalFungiIndex(result[1]);
            if (result[0]) {
                let expandRoot = curr.expandRoot(elements.fungi.fungiElements, true);
                // Every other fungi root that will normally grow
                // If removed, stay at current index since by default it will increment fungi index after no matter the circumstances
                if (expandRoot == false) {
                    DecrementFungiIndex(fungiIndex - 1);
                }
                else {
                    //curr.updateSpacing();
                    if (expandRoot != null) {
                        // Create branch fungi object
                        let branchRoot = new Fungi(expandRoot[0], expandRoot[1], false, totalFungiIndex);
                        incrementTotalFungiIndex(totalFungiIndex + 1);
                        if (curr.parentRoot != null) {
                            // Add it to root tip array
                            branchRoot.parentRoot = curr.parentRoot;
                            curr.parentRoot.parentFungi.push(branchRoot);
                        }
                        // Update all the variables
                        branchRoot.expandYDir = expandRoot[2];
                        branchRoot.expandXDir = expandRoot[3];
                        // If heading in the same direction, same boundary
                        if (branchRoot.expandXDir == curr.expandXDir) {
                            branchRoot.boundaryXWithOtherFungi = curr.boundaryXWithOtherFungi;
                        }
                        branchRoot.branchCount = --curr.branchCount;
                        branchRoot.length = curr.length + 1;
                        branchRoot.nutrientBoosted = curr.nutrientBoosted;
                        branchRoot.growthSpeed = curr.growthSpeed;
                        branchRoot.updateGrowthSpeed();

                        // Update branchProb, more likely to branch in the beginning
                        if (curr.length < 15) {
                            curr.branchProb = 1;
                            branchRoot.branchProb = 1;
                        }
                        else {
                            curr.branchProb = 0.75;
                            branchRoot.branchProb = 0.75;
                        }

                        branchRoot.spacing = curr.spacing;
                        // Spacing to make it more spread out towards the bottom
                        //branchRoot.updateSpacing();

                        // Add to general fungi array
                        elements.fungi.fungiElements.push(branchRoot);
                        grid[branchRoot.y][branchRoot.x] = 'fungi';
                    }
                }
            }
            IncrementFungiIndex(fungiIndex + 1);
            if (fungiIndex >= totalFungiIndex) {
                resetFungiIndex();
            }
        } catch (error) {
            // If an error occurs, log it and return from the function
            console.error('An error occurred:', error.message);
            return;
        }

    }
}