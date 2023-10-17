import { elements } from "./sandSim.js";

export function chemicalBehavior(y, x, grid, gridHeight, topGrid) {
    if (y + 1 < gridHeight && grid[y + 1][x] === null) {
        grid[y + 1][x] = 'chemical';
        grid[y][x] = null;
    } 
    else if(y + 1 < gridHeight && (grid[y+1][x] === 'water' || topGrid[y+1][x] === 'waterInSoil')) {
        topGrid[y + 1][x] = "chemInWater";
        grid[y][x] = null;
    }
}

export function chemInWaterBehavior(y, x, grid){
    //let currChemWater = findChemWaterByPosition(elements.chemInWater.chemWaterElements, x, y);

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
}
