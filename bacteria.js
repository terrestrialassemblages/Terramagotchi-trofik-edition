import { elements } from './sandSim.js';
import { findBacteriaByPosition } from './sandSim.js';

export default class Bacteria {
    constructor(color, frameTimer, currentDirection, directionTimer, behavior, x, y, lifespan) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.originalColor = color;
        this.frameTimer = frameTimer;
        this.currentDirection = currentDirection;
        this.directionTimer = directionTimer;
        this.behavior = behavior;
        this.oldElement = "soil"  // Default value
        this.index = 0;
        this.lifespan = lifespan;
        this.hasGenerated = false;
        this.isDying = false;
        this.aggregateCooldown = 0;
    }
    
    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
    };
    
    decreaseLifespan() {
        this.lifespan--;
    }

    die() {
        this.isDying = true;
    }
    
    createBacteriaHistoryTracker() {
        //let oldElement = "soil";  // Default value
    
        return function(newElement) {
            if (newElement == "liquidSugar"){
                newElement = "soil";
            }
            let output = this.oldElement;
            this.oldElement = newElement;
            return output;
        };
    }
    
    bacteriaHistory = this.createBacteriaHistoryTracker();
    
    choseDirection() { //currentDirection is a integer
    

        const directions = [
            {dy: -1, dx: 0},  // Up
            {dy: 0, dx: -1}, // Left
            {dy: 1, dx: 0},  // Down
            {dy: 0, dx: 1},  // Right
        ];
       
        //return directions[Math.floor(Math.random() * directions.length)];
        let newDirectionIndex = Math.floor(Math.random() * directions.length);
    
        if(this.currentDirection ==null){
            this.currentDirection = directions[newDirectionIndex];
            return directions[newDirectionIndex];
        }
    
    
        let index = 0;
        directions.forEach((dir, idx) => {
    
            if (dir.dy === this.currentDirection.dy && dir.dx === this.currentDirection.dx) {
                //console.log(`Match found at index ${idx}`);
                index = idx;
            }
        });
        
    
        if(newDirectionIndex % 2 == index % 2){
            newDirectionIndex = (index + 1) % 4; 
        }
    
        //console.log("new direction", newDirectionIndex);
        this.currentDirection = directions[newDirectionIndex];
        return directions[newDirectionIndex];
            
    }


    // Check for nearby liquidSugar
    IfNearLiquidSugar(DISTANCE, grid) {
        const directions = [
            {dy: -1, dx: 0},  // Up
            {dy: 1, dx: 0},  // Down
            {dy: 0, dx: -1}, // Left
            {dy: 0, dx: 1},  // Right
        ];

        const gridHeight = grid.length;
        const gridWidth = grid[0].length;

        for (let dy = -DISTANCE; dy <= DISTANCE; dy++) {
            for (let dx = -DISTANCE; dx <= DISTANCE; dx++) {
                if (this.y+dy >= 0 && this.y+dy < gridHeight && this.x+dx >= 0 && this.x+dx < gridWidth) {
                    if (grid[this.y+dy][this.x+dx] === 'liquidSugar') {
                        const distance = Math.sqrt(dy*dy + dx*dx);
                        if (distance <= DISTANCE) {
                            
                            
                            
                            if (dy < 0) return{
                                ifNear:true,
                                priorityDirection: directions[0]
                            }; // Up
                            else if (dy > 0) return{
                                ifNear:true,
                                priorityDirection: directions[1]
                            }; // Down
                            if (dx < 0) return{
                                ifNear:true,
                                priorityDirection: directions[2]
                            }; // Left
                            else if (dx > 0) return{
                                ifNear:true,
                                priorityDirection: directions[3]
                            }; // Right
                            
                        }
                    }
                }
            }
        }
        return{
            ifNear:false,
            priorityDirection: directions[0]
        };
    }



    //implement for aggregate
    // Check for nearby liquidSugar
    IfNearBacteria(DISTANCE, grid, number) {
        let rootTipNum = 0;
        let bacNum = 0;
        const gridHeight = grid.length;
        const gridWidth = grid[0].length;

        if (this.aggregateCooldown > 0) {
            this.aggregateCooldown--;
        }

        for (let dy = -DISTANCE; dy <= DISTANCE; dy++) {
            for (let dx = -DISTANCE; dx <= DISTANCE; dx++) {
                if (this.y+dy >= 0 && this.y+dy < gridHeight && this.x+dx >= 0 && this.x+dx < gridWidth) {
                    if (grid[this.y+dy][this.x+dx] === 'bacteria') {


                        const distance = Math.sqrt(dy*dy + dx*dx);
                        if (distance <= DISTANCE) {
                            let curr = findBacteriaByPosition(elements.bacteria.bacteriaElements, this.x+dx, this.y+dy)
                            if (curr.hasGenerated == false){
                                bacNum ++;
                                //curr.hasGenerated == true
                            }
                            
                        }
                    }
                    if (grid[this.y+dy][this.x+dx] === 'rootTip') {
                        rootTipNum++;
                    }
                }
            }
        }
        if(rootTipNum != 0){
            return false
        }

        if (bacNum >= number){
            if(this.aggregateCooldown <= 0){
                this.aggregateCooldown = 4000; //adjust value to change how often bacteria can form aggregates
                return true;
            }
            
            
        }
        
        return false;
    }


    bacteriaMovement(newY, newX, grid, processed) {
        const gridHeight = grid.length;
        const gridWidth = grid[0].length;
        //let currBacteria = findBacteriaByPosition(elements.bacteria.bacteriaElements, x, y);
        
        //console.log(currBacteria instanceof Bacteria );
        try {
            if (newX < 0 || newY < 0 || newX >= gridWidth || newY >= gridHeight-1 || grid[newY][newX] == null
                || grid[newY][newX] == 'bacteria') {
                return; // Exit the function if out of bounds
            }
            
            let elementToRestore = this.bacteriaHistory(grid[newY][newX]);
            //console.log(grid[newY][newX])
            //console.log(elementToRestore);
            
            // Move the bacteria to the new cell
            grid[newY][newX] = 'bacteria';
            grid[this.y][this.x] = elementToRestore;

            this.updatePosition(newX, newY);
            
            processed[newY][newX] = true;
            
            /*
            bacteriaIndex++;
            if (bacteriaIndex > totalBacteriaIndex){
                bacteriaIndex = 0;
            }
            */
        } catch (error) {
            // If an error occurs, log it and return from the function
            console.error('An error occurred:', error.message);
            return;
        }
    }

    fade(ctx, elements, cellSize, grid, index) {
        if (!this.fading) {
            this.fading = true;
            this.fadeAlpha = 1.0;
        }

        this.fadeAlpha -= 0.01; // Adjust fading speed

        ctx.fillStyle = elements.soil.color;
        ctx.fillRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);

        if (this.fadeAlpha <= 0) {
            grid[this.y][this.x] = this.oldElement;
            //elements.bacteria.bacteriaElements.splice(index, 1);
        } else {
            const fadedColor = this.interpolateColor(this.color, elements.soil.color, 1 - this.fadeAlpha);
            ctx.fillStyle = fadedColor;
            ctx.fillRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);

            if (1 - this.fadeAlpha === 0) {
                grid[this.y][this.x] = 'soil';
            }
        }
    }
    
    
    interpolateColor(color1, color2, alpha) {

        if (!color1 || !color2) {
            return "#452c1b";
        }

        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);

        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * alpha);
        const g = Math.round(g1 + (g2 - g1) * alpha);
        const b = Math.round(b1 + (b2 - b1) * alpha);

        let resultColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        //console.log("color:", resultColor);
        return resultColor;
    }

    
}