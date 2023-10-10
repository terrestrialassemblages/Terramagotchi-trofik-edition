import { elements , topGrid} from "./sandSim.js";

export function waterInSoilBehavior(y, x, grid){
    // If no block below, remove
    if (topGrid[y + 1][x] === null && grid[y + 1][x] === 'soil') {
        topGrid[y][x] = null;
        topGrid[y+1][x] = 'waterInSoil';
    }
    else if (topGrid[y + 1][x] === 'waterInSoil'){
        topGrid[y][x] = null;
    }
}