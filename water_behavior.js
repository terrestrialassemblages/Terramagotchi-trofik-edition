import { elements , topGrid} from "./sandSim.js";
import {sunShow, sunValue} from './weather.js';
import WaterInSoil from './waterInSoil.js';

let life_span = 20;

export function resetLifeSpan(){
    life_span = 20;
}

export function waterBehavior(y, x, grid, gridHeight) {
    try{
        // Check for an empty space below and move water down
        if (y + 1 < gridHeight && grid[y + 1][x] === null && topGrid[y + 1][x] === null) {
            grid[y + 1][x] = 'water';
            grid[y][x] = null;
        } else if( y + 1 < gridHeight && grid[y + 1][x] === 'soil') {
            if (elements.soil.soilAlpha[(y+1) + "," + x] <= 0.49){
                if (grid[y + 1][x] = 'soil'){
                    topGrid[y + 1][x] = "waterInSoil";
                    //console.log("behavior", x, y+1);
                    elements.waterInSoil.waterElements.push(new WaterInSoil(x, y+1, 1200));
                    
                    grid[y][x] = null;
                    
                }
            }
            else {
                grid[y][x] = 'water';
                
                if (sunShow) {
                    // Introduce a random factor to decide whether life_span should decrease.
                    let randomFactor = Math.random();  // This will generate a random number between 0 and 1
                    
                    // Calculate the probability for life_span to not decrease
                    // assuming sunValue is between 0 and 10.
                    let noDecreaseProbability = (10 - sunValue) / 10;
                    if (sunValue == 6){
                        life_span = 20;
                    }
                    // Only decrease the life_span if the random factor is greater than the calculated probability.
                    if (randomFactor >= noDecreaseProbability) {
                        life_span--;
                    }
                    else{
                        if (sunValue <= 5){
                            life_span++;
                        }
                    }
            
                    // If life_span is 0, evaporate the water
                    if (life_span <= 0) {
                        grid[y][x] = null;
                        life_span = 20;
                    }
                }
            }
            
            
            
            
        }else if (y + 1 < gridHeight && topGrid[y + 1][x] === 'chemical') {
            // Make the element at [y+1][x] 'chemInWater'
            topGrid[y + 1][x] = 'chemInWater';
            
            // Define the offsets for directly adjacent elements
            const offsets = [
                { dy: 0, dx: 1 },  // Right
                { dy: 0, dx: -1 }, // Left
                { dy: 1, dx: 0 },  // Down
                { dy: -1, dx: 0 }  // Up
            ];
            
            // Iterate through the offsets to update adjacent elements
            for (const { dy, dx } of offsets) {
                const newY = y + 1 + dy;
                const newX = x + dx;
                
                // Check boundary conditions
                if (newY >= 0 && newY < gridHeight && newX >= 0 && newX < topGrid[0].length) {
                    topGrid[newY][newX] = 'chemInWater';
                }
            }
            
            topGrid[y][x] = null;
            //console.log('chemInWater');
        }
        
        /*
        else if ( y + 1 < gridHeight && grid[y + 1][x] === 'plant'){
            grid[y][x] = 'water';
        }
        */
        else {
            grid[y][x] = null;
        }
    }catch (error) {
        // If an error occurs, log it and return from the function
        console.error('An error occurred:', error.message);
        return;
    }
}

 