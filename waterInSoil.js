import { elements , topGrid, timeWaterSink} from "./sandSim.js";
import { sunShow } from "./weather.js";

export function waterInSoilBehavior(y, x, grid){
    //console.log(elements.waterInSoil.waterElements);
    //console.log(x, y);
    let currWater = findWaterByPosition(elements.waterInSoil.waterElements, x, y);

    if (sunShow){
        currWater.decreaseLifespan();
    }
    if(currWater.lifespan == 0){
        topGrid[y][x] = null;
        return;
    }
    // If no block below, remove
    if (topGrid[y + 1][x] === null && grid[y + 1][x] === 'soil') {
        //console.log(elements.soil.soilAlpha[(y+1) + "," + x])
        if (timeWaterSink % 120 == 0) {

            if (elements.soil.soilAlpha[(y+1) + "," + x] <= 0.7){
                topGrid[y][x] = null;
                topGrid[y+1][x] = 'waterInSoil';
                currWater.updatePosition(x, y+1);
                currWater.IncreaseLifespan();
            }
        }
        else{
            topGrid[y][x] = 'waterInSoil';
        }
        
    }
    else if (topGrid[y + 1][x] === 'waterInSoil' || topGrid[y + 1][x] === 'liquidSugar'){
        topGrid[y][x] = null;
    }
}


export default class WaterInSoil {
    constructor(x, y, lifespan) {
        this.x = x;
        this.y = y;
        this.evaporate = false;
        this.previousY = y;

        this.lifespan = lifespan;
    }

    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
    };

    decreaseLifespan() {
        this.lifespan--;
    }

    IncreaseLifespan() {
        this.lifespan+=4000;
    }

    evaporate() {
        this.evaporate = true;
    }
}



export function findWaterByPosition(waterElements, x, y) {
    for (let water of waterElements) {
        //console.log (x, y, water.x, water.y);
        if (water.x === x && water.y === y) {
            //console.log('true');
            return water;
        }
    }
    return null;  // Return null if no matching bacteria is found
}

