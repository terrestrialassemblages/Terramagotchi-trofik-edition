import { elements, grid } from "../sandSim.js";
import Plant from "./plant.js";

export function plantAt(y, x, root) {
    let plantObj = new Plant(y, x, root);
    grid[y][x] = 'plant';
    let plantHeight = Math.floor(root.length); 
    plantObj.setHeight(plantHeight);
    elements.plant.plantElements.push(plantObj);
}

export function updatePlantGrowth() {
    for (const plantObj of elements.plant.plantElements) {
        plantObj.grow();
    }
}