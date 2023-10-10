import { elements } from "./sandSim.js";

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
        }
        
    }
    else {
        grid[y][x] = null;
    }
}