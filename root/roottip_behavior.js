
import { elements } from '../sandSim.js';
import { totalRootIndex, rootIndex, IncementRootIndex, resetRootIndex, incrementTotalRootIndex } from '../sandSim.js';




export function rootTipBehavior(y, x, grid) {
    try{
        // Update for every RootTip instance in the grid array
        if (totalRootIndex > 0) {

            // Get the current rootTip object
            let curr = elements[grid[y][x]].rootElements[rootIndex];
            //console.log(elements[grid[y][x]].rootElements);
            //console.log(totalRootIndex, rootIndex);


            // Check if sugar produced has been eaten
            curr.sugarEaten()

            // Ckeck if root can grow
            let result = curr.growBool(totalRootIndex);

            // Update totalRootIndex
            incrementTotalRootIndex(result[1]);
            //totalRootIndex = result[1];

            // If it can grow, expand root
            if (result[0]) {
                incrementTotalRootIndex(curr.expandRoot(elements.rootTip.rootElements, rootIndex, totalRootIndex));
                //totalRootIndex = curr.expandRoot(elements.rootTip.rootElements, rootIndex, totalRootIndex);
            }
            IncementRootIndex(rootIndex + 1);
            //rootIndex++;

            // Reset index once we finish iterating through all the rootTips
            if (rootIndex >= totalRootIndex) {
                //rootIndex = 0;
                resetRootIndex();
            }
        }
    }catch (error) {
        // If an error occurs, log it and return from the function
        console.error('An error occurred:', error.message);
        return;
    }
}