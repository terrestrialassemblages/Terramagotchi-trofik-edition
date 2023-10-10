import { elements } from "./sandSim.js";
import {sunShow} from './weather.js';

let life_span = 20;

export function waterBehavior(y, x, grid, gridHeight) {
    // Check for an empty space below and move water down
    if (y + 1 < gridHeight && grid[y + 1][x] === null) {
        grid[y + 1][x] = 'water';
        grid[y][x] = null;
    } else if( y + 1 < gridHeight && grid[y + 1][x] === 'soil') {
        if (elements.soil.soilAlpha[(y+1) + "," + x] <= 0.3){
            if (grid[y + 1][x] = 'soil'){
                grid[y + 1][x] = "waterInSoil";
                
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