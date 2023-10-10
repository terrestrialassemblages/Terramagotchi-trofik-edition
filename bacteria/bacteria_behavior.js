import { grid, processed, canvas } from '../sandSim.js';
import Bacteria from './bacteria.js';
import { elements, timeMove, changeChosenDirection, chosenDirection} from '../sandSim.js';
import {generateSoil} from '../aggregate/aggregate_behavior.js';


export function bacteriaBehavior (y, x, grid){
    const gridHeight = grid.length;
    const gridWidth = grid[0].length;

    let currentBac = findBacteriaByPosition(elements.bacteria.bacteriaElements, x, y)

    // if bacteria is fading, dont move
    if (currentBac.fading) {      
        return;
    }

    let DISDANCE = 40;
    const result = currentBac.IfNearLiquidSugar(DISDANCE, grid);

    let Agregate = currentBac.IfNearBacteria(5, grid, 2)
    //console.log("agr", Agregate)
    
    if (Agregate){
        generateSoil(y, x);
    }
    
    

    let ifNear = result.ifNear;
    let priorityDirection = result.priorityDirection;
    //console.log(priorityDirection);

    if (ifNear) {
        //console.log(timeMove % elements.bacteria.frameTimer);
        if (timeMove % elements.bacteria.frameTimer == 0) {

            changeChosenDirection(priorityDirection);

            //console.log(chosenDirection);
            let random = Math.floor(Math.random() * 4);
            if (random == 0){
                changeChosenDirection(currentBac.choseDirection());
            }
            

            

            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            if (grid[newY][newX] === 'liquidSugar') {
                grid[newY][newX] = 'bacteria';
                elements.bacteria.bacteriaElements.push(new Bacteria("#800080", 15, null, 0, [], newX, newY, 400000))
            } else {
                currentBac.bacteriaMovement(newY, newX, grid, processed);
            }
            
        }
        
    }
    else {
        //console.log(timeMove % elements.bacteria.frameTimer);
        if (timeMove % elements.bacteria.frameTimer == 0) {

            //directionTimer smaller change direction more frequentlly
            if (elements.bacteria.directionTimer % 5 !== 0) {
                changeChosenDirection(currentBac.choseDirection());
            }
            else {
                if (currentBac.currentDirection !== null) {
                    changeChosenDirection(currentBac.choseDirection());
                    // If the bacteria is touching any boundary, choose a new direction
                    if (y == 0 || y == gridHeight - 1 || x == 0 || x == gridWidth - 1) {
                        changeChosenDirection(currentBac.choseDirection());
                    }
                }
                else {
                    changeChosenDirection(currentBac.choseDirection());
                }
            }
            elements.bacteria.directionTimer++;
            //console.log(chosenDirection);



            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            currentBac.bacteriaMovement(newY, newX, grid, processed);

        }
    }
}

export function findBacteriaByPosition(bacteriaElements, x, y) {
    for (let bacteria of bacteriaElements) {
        if (bacteria.x === x && bacteria.y === y) {
            return bacteria;
        }
    }
    return null;  // Return null if no matching bacteria is found
}

export function generateBacterial() {
    //grid[129][20] = 'bacteria';

    let currY = 80

    if (canvas.width > canvas.height){
        currY = (Math.ceil(80/(canvas.width/canvas.height)));
    }

    for (let i = 0; i < 50; i++) {


        const randomX = Math.floor(Math.random() * (200 - 0 + 1)) + 0;
        const randomY = Math.floor(Math.random() * (120 - currY + 1)) + currY;
        if (grid[randomY][randomX]== 'soil') {
            grid[randomY][randomX] = 'bacteria';
            //grid[randomY+1][randomX+1] = 'bacteria';
        }


        elements.bacteria.bacteriaElements.push(new Bacteria("#800080", 15, null, 0, [], randomX, randomY, 400000))


    }
}