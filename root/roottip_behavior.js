import RootTip from './rootTip.js';
import Fungi from '../fungi/fungi.js';
import { elements } from '../sandSim.js';
import { grid, canvas } from '../sandSim.js';
import { totalRootIndex, rootIndex, IncrementRootIndex, resetRootIndex, incrementTotalRootIndex, decrementRootIndex } from '../sandSim.js';
import { timeStep, globalY, TIMESCALE } from '../sandSim.js';
import { gridWidth, gridHeight } from '../sandSim.js';
import { totalFungiIndex } from '../sandSim.js';
import { fungiIndex } from '../sandSim.js';
import { sunValue } from '../weather/weather.js';


export function rootTipBehavior(y, x, grid) {
    try{
        // Update for every RootTip instance in the grid array
        if (totalRootIndex > 0) {

            // Get the current rootTip object
            let curr = elements[grid[y][x]].rootElements[rootIndex];

            // Check if sugar produced has been eaten
            curr.sugarEaten()

            // Update based on changing TIMESCALE
            curr.growthSpeedLimit = Math.round(curr.baseGrowthSpeedLimit * TIMESCALE);

            if (curr.sugarProduceSpeed == 0) {
                curr.sugarProduceCount = 0;
            }

            // Check to make liquid sugar
            if (curr.sugarProduceSpeed != 0 && timeStep >= curr.sugarProduceSpeed) {
                curr.produceSugarBeforeGrowth();
            }

            // If sunValue changed, change growth speed
            if (sunValue != curr.prevSunValue) {
                curr.boostGrowthSpeed(sunValue);
                // Add liquid sugar when changing from night to day and day to night to prevent bacteria from all dying
                if (sunValue <= 6 && sunValue >= 3 && curr.sugarProduceSpeed != 0) {;
                    curr.produceSugar();
                }
            }

            curr.prevSunValue = sunValue;

            // Only check if its greater than 0.5 because it will go down to min 0.5 anyway
            if (curr.boostValue > 0.5) {
                if (curr.checkSurroundingForElement(curr.y, curr.x, 'waterInSoil')) {
                    // Limit to 0.7 if sunny
                    if (curr.prevSunValue >= 5) {
                        curr.boostValue = Math.max(curr.boostValue - 0.1, 0.7);
                    }
                    // Limit to 1.05 if night and decrement less
                    else {
                        curr.boostValue = Math.max(curr.boostValue - 0.05, 1.05);
                    }
                }
            }


            // Check if root can grow
            let result = curr.growBool(totalRootIndex);

            // Update totalRootIndex
            incrementTotalRootIndex(result[1]);
            //totalRootIndex = result[1];

            // If it can grow, expand root
            if (result[0]) {
                // Let it branch again after growing longer
                if (curr.length >= 20 && curr.length % 10 == 0) {
                    if (curr.branchCount < 3) {
                        // Cap it to 5
                        curr.branchCount = Math.min(curr.branchCount + 2, 3);
                        curr.branchProb = 0.4;
                    }
                }
                let expandRoot = curr.expandRoot(elements.rootTip.rootElements, false);
                // Removed a root
                if (expandRoot == false) {
                    // Removed the current index so redo the same index with the rest of the roots having updated index as it is going to increment by default
                    decrementRootIndex(rootIndex - 1);
                }
                // Returned branchRoot variables
                else if (expandRoot != null) {

                    // Update branch probability 
                    if (curr.length <= 3) {
                        curr.branchProb = 1;
                    }
                    else {
                        curr.branchProb = 0.4;
                    }

                    // Create branch root object
                    let branchRoot = new RootTip(expandRoot[0], expandRoot[1], curr.fungiParent, totalRootIndex);
                    incrementTotalRootIndex(totalRootIndex + 1);

                    // Update values
                    branchRoot.expandYDir = expandRoot[2];
                    branchRoot.expandXDir = expandRoot[3];
                    branchRoot.branchCount = --curr.branchCount;
                    branchRoot.length = curr.length + 1;
                    branchRoot.growthSpeed = curr.growthSpeed;
                    branchRoot.updateGrowthSpeed();
                    branchRoot.branchProb = curr.branchProb;
                    branchRoot.spacing = curr.spacing;
                    branchRoot.parentFungi = curr.parentFungi;
                    branchRoot.sugarProduceSpeed = curr.sugarProduceSpeed;
                    branchRoot.sugarProduceCount = curr.sugarProduceCount;
                    branchRoot.boostValue = curr.boostValue;
                    branchRoot.prevSunValue = curr.preSunValue;

                    elements.rootTip.rootElements.push(branchRoot);
                    grid[branchRoot.y][branchRoot.x] = 'rootTip';
                }
                //totalRootIndex = curr.expandRoot(elements.rootTip.rootElements, rootIndex, totalRootIndex);
            }
            IncrementRootIndex(rootIndex + 1);
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