import { totalFungiIndex, fungiIndex, IncementFungiIndex, DecrementFungiIndex, resetFungiIndex } from '../sandSim.js';
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
                //console.log("TIME TO GROW");
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
                    // Every other fungi root that will normally grow
                    if (curr.expandRoot(elements.fungi.fungiElements, fungiIndex, totalFungiIndex) == false) {
                        DecrementFungiIndex(fungiIndex - 1);
                    }
                }
            }
            IncementFungiIndex(fungiIndex + 1);

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