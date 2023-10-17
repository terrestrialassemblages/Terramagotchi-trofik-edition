import { elements, grid } from "../sandSim.js";
import Plant from "./plant.js";

export const plantPattern = [
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 1, 0],
    [0, 1, 1, 1, 0, 0, 1, 1],
    [1, 1, 1, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 0, 0, 0],   
];



export function plantAt(y, x, root) {
    let plantObj = new Plant(y, x, root);
    grid[y][x] = 'plant'; 
    elements.plant.plantElements.push(plantObj);
}

export function updatePlantGrowth() {
    for (const plantObj of elements.plant.plantElements) {
        plantObj.grow(plantObj.root.length, plantPattern);
    }
}

