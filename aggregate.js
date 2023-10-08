import { elements } from './sandSim.js';

export default class Aggregate{
    constructor(y, x, behavior, color) {
        this.x = x;
        this.y = y;
        this.behavior = behavior;
        this.color = color
        this.hasGrow = false;
        this.aggrCount = 0;
    }

    isTouchFungi(grid) {
        const directions = [
            { dx: 0, dy: -1 },  // top
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // bottom
            { dx: -1, dy: 0 }  // left
        ];

        const gridHeight = grid.length;
        const gridWidth = grid[0].length;
/*
        directions.forEach((dir) => {
    
            if (this.y+dir.dy >= 0 && this.y+dir.dy < gridHeight && this.x+dir.dx >= 0 && this.x+dir.dx < gridWidth) {
                if (grid[newY][newX] === 'fungi') {
                    return true;
                }
            }
        });*/

        for (let dir of directions) {
            let newX = this.x + dir.dx;
            let newY = this.y + dir.dy;
            if (newY >= 0 && newY < gridHeight && newX >= 0 && newX < gridWidth) {
                if (grid[newY][newX] === 'fungi') {
                    return true;
                }
            }
        }
        return false;
    }

    ifNearOtherAgg(DISTANCE, grid) {
        let hasMoreAggre = false;
        let rootTipCount = 0;
        //let currAggr = findAggregateByPosition(elements.aggregate.bacteriaElements, x, y);
        //const DISTANCE = 3;
        let aggrCount = 0
        const gridHeight = grid.length;
        const gridWidth = grid[0].length;
        let isNear = false;  // Initialize the return value
    
        for (let dy = -DISTANCE; dy <= DISTANCE; dy++) {
            for (let dx = -DISTANCE; dx <= DISTANCE; dx++) {
                // Skip the current cell
                if (dy === 0 && dx === 0) {
                    continue;
                }
                if (this.y+dy >= 0 && this.y+dy < gridHeight && this.x+dx >= 0 && this.x+dx < gridWidth) {
                    if (grid[this.y + dy][this.x + dx] === 'aggregate') {
                        const distance = Math.sqrt(dy*dy + dx*dx);
                        if (distance <= 3) {
                            //aggrCount ++;
                            //console.log('near');
                            //if (isTouchFungi(x, y) && isTouchFungi(newX, newY)) {
                            if (this.isTouchFungi(grid)) {
                                //console.log('valid aggregate grow');
                                isNear = true;  // Set the return value
                            }
                        }
                        if (distance <= DISTANCE) {
                            aggrCount ++;
                        }
                        if (distance <= DISTANCE && grid[this.y + dy][this.x + dx] === 'rootTip') {
                            rootTipCount ++;
                        }
                    } 
                }
            }
        }

        if(aggrCount != this.aggrCount){
            hasMoreAggre = true;
            this.aggrCount = aggrCount;
        }
        if (rootTipCount!=0){
            isNear = false;
        }
        return [isNear, aggrCount, hasMoreAggre];  // Return the result
    }

}
