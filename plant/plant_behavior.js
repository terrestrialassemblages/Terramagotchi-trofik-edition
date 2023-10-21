import { elements, grid } from "../sandSim.js";
import Plant from "./plant.js";


export function plantAt(y, x, root) {
    const chosenPattern = getRandomPlantPattern();
    let plantObj = new Plant(y, x, root, chosenPattern);
    grid[y][x] = 'plant'; 
    elements.plant.plantElements.push(plantObj);
}

export function updatePlantGrowth() {
    for (const plantObj of elements.plant.plantElements) {
        plantObj.grow(plantObj.root.length);
        if (plantObj.heightMatrix) {
        /*
        if (plantObj.root.length <= 11) {
            let y = plantObj.startingY - Math.floor(plantObj.root.length / 2);
            let x = plantObj.startingX; 
            grid[y][x] = 'plant';
        }
        else if (plantObj.heightMatrix) {*/
            for (let row = 0; row < plantObj.heightMatrix.length; row++) {
                for (let col = 0; col < plantObj.heightMatrix[row].length; col++) {
                    if (plantObj.heightMatrix[row][col] === 1) {
                        let y = plantObj.startingY - row;
                        let x = plantObj.startingX + col - Math.floor(plantObj.pattern[0].length / 2);
                        grid[y][x] = 'plant';
                    }
                    /*
                    else{
                        let y = plantObj.startingY - row;
                        let x = plantObj.startingX + col - Math.floor(plantObj.pattern[0].length / 2);
                        grid[y][x] = 'null';
                    }*/                   
                }
            }
        }
    }
}

export const plantPattern = [
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0, 1, 1],
    [0, 1, 1, 1, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 1, 0, 0, 0],   
];

export const plantPattern_0 = [
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 1, 0, 0],
];

export const plantPattern_1 = [
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 1, 1, 0, 0, 0],
];
export const patterns = [plantPattern, plantPattern_0, plantPattern_1];

function getRandomPlantPattern() {

    const randomIndex = Math.floor(Math.random() * patterns.length);
    const selectedPattern = patterns[randomIndex];

    patterns.splice(randomIndex, 1);
    return selectedPattern;
}