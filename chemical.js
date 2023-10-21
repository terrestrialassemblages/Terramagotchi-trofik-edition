import RootStructure from "./root/root.js";
import Fungi from "./fungi/fungi.js";
import { elements, grid, topGrid, gridHeight, timeWaterSink, gridWidth, globalY, totalFungiIndex, incrementTotalFungiIndex } from "./sandSim.js";
let life_span = 20;
import {sunShow, sunValue} from './weather.js';

export function chemicalBehavior(y, x, grid, gridHeight, topGrid) {
    const gridWidth = topGrid[0].length;

    // Check if the bottom is empty, if yes, move downward
    if (y + 1 < gridHeight && grid[y + 1][x] === null && topGrid[y + 1][x] === null) {
        topGrid[y + 1][x] = 'chemical';
        topGrid[y][x] = null;
        return;
    }

    // Check if the bottom-left is empty, if yes, move bottom-left
    if (y + 1 < gridHeight && x - 1 >= 0 && grid[y + 1][x - 1] === null && topGrid[y + 1][x - 1] === null) {
        topGrid[y + 1][x - 1] = 'chemical';
        topGrid[y][x] = null;
        return;
    }

    // Check if the bottom-right is empty, if yes, move bottom-right
    if (y + 1 < gridHeight && x + 1 < gridWidth && grid[y + 1][x + 1] === null && topGrid[y + 1][x + 1] === null) {
        topGrid[y + 1][x + 1] = 'chemical';
        topGrid[y][x] = null;
        return;
    }

    if (grid[y+1][x] == 'water'){
        topGrid[y+1][x] = 'chemInWater';
        grid[y][x] = null;
        topGrid[y][x] = null;
    }

    if (topGrid[y+1][x] == 'chemInWater' && grid[y+1][x] == null){
        topGrid[y+1][x] = 'chemical';
        topGrid[y][x] = 'chemInWater';
        //topGrid[y][x] = null;
    }

    // Add more behaviors based on your requirements
}


export function generateChemical(y, x) {
    try {
        
        
        let aggregateSizeX = Math.floor(Math.random() * 2) + 5;
        let aggregateSizeY = Math.floor(Math.random() * 2) + 10;
        

        const rotationAngle = Math.random() * Math.PI * 2;

        // Calculate the start and end points to make (y, x) the center
        const startX = x - Math.floor(aggregateSizeX / 2);
        const startY = y - Math.floor(aggregateSizeY / 2);
        const endX = startX + aggregateSizeX;
        const endY = startY + aggregateSizeY;

        for (let aggregateX = startX; aggregateX < endX; aggregateX++) {
            for (let aggregateY = startY; aggregateY < endY; aggregateY++) {
                const i = aggregateX - x;
                const j = aggregateY - y;

                // Calculate elliptical values with increased noise
                const noise = Math.random() * 0.3 - 0.15;
                let ellipseX = (i + noise) / (aggregateSizeX / 2);
                let ellipseY = (j + noise) / (aggregateSizeY / 2);

                // Rotate the coordinates
                const rotatedX = ellipseX * Math.cos(rotationAngle) - ellipseY * Math.sin(rotationAngle);
                const rotatedY = ellipseX * Math.sin(rotationAngle) + ellipseY * Math.cos(rotationAngle);

                const distanceFromCenter = rotatedX * rotatedX + rotatedY * rotatedY;
                const inEllipse = distanceFromCenter <= 1;

                // Use a smoother function for the drawing probability
                const probability = Math.random();
                const threshold = 1 - Math.pow(distanceFromCenter, 0.5);

                if (inEllipse && probability < threshold) {
                    if (aggregateY>0 && aggregateY<150 && aggregateX>0 && aggregateX<200){
                        topGrid[aggregateY][aggregateX] = 'chemical'
                    }
                    
                    
                }
            }
        }
    } catch (error) {
        // If an error occurs, log it and return from the function
        console.error('An error occurred:', error.message);
        return;
    }

}

export function chemInWaterBehavior(y, x, gridHeight) {
    if (sunShow) {
        // Introduce a random factor to decide whether life_span should decrease.
        let randomFactor = Math.random();  // This will generate a random number between 0 and 1
        
        // Calculate the probability for life_span to not decrease
        // assuming sunValue is between 0 and 10.
        let noDecreaseProbability = (10 - sunValue) / 10;

        // Only decrease the life_span if the random factor is greater than the calculated probability.
        if (randomFactor >= noDecreaseProbability) {
            life_span--;
            
        }
        // If life_span is 0, evaporate the water
        if (life_span <= 0) {
            //console.log(topGrid[y][x])
            topGrid[y][x] = null;
            //console.log(topGrid[y][x])
            life_span = 20;
            return;
        }
    }
    if (topGrid[y + 1][x] === 'chemInWater'){
        if (topGrid[y + 2][x] === 'chemInWater'){
            topGrid[y][x] = null;
            return;
        }
        if (grid[y + 2][x] === 'aggregate'){
            topGrid[y][x] = null;
            //topGrid[y+1][x] = null;
            return;
        
        }
    }

    /*
    if (y + 1 == globalY){
        if (elements.soil.soilAlpha[(y+1) + "," + x] >= 0.5){
            return;
        }
    }
    */

    // Check if the bottom is empty; if yes, move downward
    if (y + 1 < gridHeight && topGrid[y + 1][x] === null && grid[y + 1][x] === null) {
        topGrid[y + 1][x] = 'chemInWater';
        topGrid[y][x] = null;
        life_span +=130;
        return;
    }
    // If the element below is 'chemical', then flow sideways
    else if (y + 1 < gridHeight && topGrid[y + 1][x] === 'chemical') {
        const offsets = [
            { dx: 1 },  // Right
            { dx: -1 }  // Left
        ];
        
        for (const { dx } of offsets) {
            const newX = x + dx;

            // Check boundary conditions and whether the new position is empty
            if (newX >= 0 && newX < topGrid[0].length && topGrid[y][newX] === null) {
                topGrid[y][newX] = 'chemInWater';
                topGrid[y][x] = null;
                return;  // Exit after moving
            }
        }
    }

    if (grid[y][x] == 'fungi'){
        grid[y][x] = 'soil';

        let randomFac = Math.random();  // This will generate a random number between 0 and 1
        
        let restoreProbability = 0.4

        // Only decrease the life_span if the random factor is greater than the calculated probability.
        if (randomFac >=restoreProbability) {
            //restoreFungi
            // Find the connected fungi around this location, prioritise from above
            outerloop:
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (grid[y + i][x + j] == 'fungi') {
                            // Create new fungi tip at this location
                            // Direction shouldn't matter
                            let restoredFungi = new Fungi(y + i, x + j, false, totalFungiIndex);
                            elements.fungi.fungiElements.push(restoredFungi);
                            incrementTotalFungiIndex(totalFungiIndex + 1);
                            // Adjust class variables
                            // Give it a rough length
                            restoredFungi.regrow = true;
                            restoredFungi.length = Math.round(1.3 * Math.abs(y - globalY));
                            restoredFungi.growthSpeedLimit = 2200;
                            // If it can't grow in the randomised x direction, change it
                            if (restoredFungi.expandRoot(elements.fungi.fungiElements, true) == false) {
                                restoredFungi.expandXDir *= -1;
                            }
                            // Update growth speed will be called once in expandRoot already if it is true but thats fine as it is a "regrowing" fungi, so growing slower initially is fine
                            restoredFungi.updateGrowthSpeed();
                            break outerloop;
                        }
                    }
                }
        }
        //topGrid[y][x] = null;
    }

    // If no block below, remove
    if (topGrid[y + 1][x] === null && (grid[y + 1][x] === 'soil' || grid[y + 1][x] === 'fungi'
    || grid[y + 1][x] === 'root' || grid[y + 1][x] === 'rootTip')) {
        //console.log(elements.soil.soilAlpha[(y+1) + "," + x])
        if (timeWaterSink % 60 == 0) {
            life_span +=130;

            if (elements.soil.soilAlpha[(y+1) + "," + x] <= 0.7){
                topGrid[y][x] = null;
                topGrid[y+1][x] = 'chemInWater';
                //currWater.updatePosition(x, y+1);
                //currWater.IncreaseLifespan();
            }
            else if (topGrid[y][x+1] === null && elements.soil.soilAlpha[(y) + "," + (x+1)] <= 0.7){
                topGrid[y][x] = null;
                topGrid[y][x+1] = 'chemInWater';
                //currWater.updatePosition(x+1, y);
            }
            else if (topGrid[y][x-1] === null && elements.soil.soilAlpha[(y) + "," + (x-1)] <= 0.7){
                topGrid[y][x] = null;
                topGrid[y][x-1] = 'chemInWater';
                //currWater.updatePosition(x-1, y);
            }
        }
        else{
            life_span --;
            topGrid[y][x] = 'chemInWater';
        }
        
    }
    else if (topGrid[y + 1][x] === 'liquidSugar' || topGrid[y + 1][x] === 'water' ||topGrid[y + 1][x] === 'waterInSoil'){
        topGrid[y][x] = null;
    }
    
    else{
        life_span --;
        topGrid[y][x] = 'chemInWater';
    }


    
}


    
    //let currChemWater = findChemWaterByPosition(elements.chemInWater.chemWaterElements, x, y);

    /*
    if (sunShow){
        currChemWater.decreaseLifespan();
    }
    if(currChemWater.lifespan == 0){
        topGrid[y][x] = null;
        return;
    }

    if (topGrid[y + 1][x] === null && grid[y + 1][x] === 'soil') {
        if (timeWaterSink % 120 == 0) {
            if (elements.soil.soilAlpha[(y+1) + "," + x] <= 0.7) {
                topGrid[y][x] = null;
                topGrid[y + 1][x] = 'chemInWater';
                currChemWater.updatePosition(x, y+1);
                currChemWater.IncreaseLifespan();
            }
        }
        else {
            topGrid[y][x] = 'chemInWater';
        }
    }
    else if (topGrid[y + 1][x] === 'chemInWater' || topGrid[y + 1][x] === 'liquidSugar' || topGrid[y + 1][x] === 'waterInSoil') {
        topGrid[y][x] = null;
    }
    */
    


