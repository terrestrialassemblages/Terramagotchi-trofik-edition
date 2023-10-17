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
            // If root is not at max size, expand root
            let result = curr.growBool(totalFungiIndex);
            incrementTotalFungiIndex(result[1]);
            if (result[0]) {
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
                    let expandRoot = curr.expandRoot(elements.fungi.fungiElements, true);
                    // Every other fungi root that will normally grow
                    // If removed, stay at current index since by default it will increment fungi index after no matter the circumstances
                    if (expandRoot == false) {
                        DecrementFungiIndex(fungiIndex - 1);
                    }
                    else {
                        curr.updateSpacing();
                        if (expandRoot != null) {
                            // Create branch fungi object
                            let branchRoot = new Fungi(expandRoot[0], expandRoot[1], false, totalFungiIndex);
                            incrementTotalFungiIndex(totalFungiIndex + 1);
                            // Add it to root tip array
                            branchRoot.parentRoot = curr.parentRoot;
                            curr.parentRoot.parentFungi.push(branchRoot);
                            // Update all the variables
                            branchRoot.expandYDir = expandRoot[2];
                            branchRoot.expandXDir = expandRoot[3];
                            branchRoot.branchCount = --curr.branchCount;
                            branchRoot.length = curr.length + 1;
                            branchRoot.branchElement = curr.branchElement;
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
                            branchRoot.updateSpacing();
                            // Add to general fungi array
                            elements.fungi.fungiElements.push(branchRoot);
                            grid[branchRoot.y][branchRoot.x] = 'fungi';
                        }
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