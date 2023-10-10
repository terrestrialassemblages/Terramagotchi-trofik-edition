import { elements , topGrid} from "./sandSim.js";
import {sunShow} from './weather.js';
import WaterInSoil from './waterInSoil.js';

let life_span = 20;

export function waterBehavior(y, x, grid, gridHeight) {
    // Check for an empty space below and move water down
    if (y + 1 < gridHeight && grid[y + 1][x] === null) {
        grid[y + 1][x] = 'water';
        grid[y][x] = null;
    } else if( y + 1 < gridHeight && grid[y + 1][x] === 'soil') {
        if (elements.soil.soilAlpha[(y+1) + "," + x] <= 0.8){
            if (grid[y + 1][x] = 'soil'){
                topGrid[y + 1][x] = "waterInSoil";
                //console.log("behavior", x, y+1);
                elements.waterInSoil.waterElements.push(new WaterInSoil(x, y+1, 120));
                
                grid[y][x] = null;
                
            }
        }
        else{
            grid[y][x] = 'water';
            if (sunShow) {
                life_span--;
        
                // If life_span is 0, evaporate the water
                if (life_span <= 0) {
                    grid[y][x] = null;
                    life_span = 20;
                }
            }
        }
        
    }
    else {
        grid[y][x] = null;
    }
}