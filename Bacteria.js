export default class Bacteria {
    constructor(color, frameTimer, currentDirection, directionTimer, behavior, x, y, lifespan) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.frameTimer = frameTimer;
        this.currentDirection = currentDirection;
        this.directionTimer = directionTimer;
        this.behavior = behavior;
        this.oldElement = "soil"  // Default value
        this.index = 0;
        this.lifespan = lifespan;
    }
    
    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
    };
    
    decreaseLifespan() {
        this.lifespan--;
    }

    
    createBacteriaHistoryTracker() {
        //let oldElement = "soil";  // Default value
    
        return function(newElement) {
            if (newElement == "liquid_sugar"){
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


    // Check for nearby liquid_sugar
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
                    if (grid[this.y+dy][this.x+dx] === 'liquid_sugar') {
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

    bacteriaMovement(newY, newX, grid, processed) {
        const gridHeight = grid.length;
        const gridWidth = grid[0].length;
        //let currBacteria = findBacteriaByPosition(elements.bacteria.bacteriaElements, x, y);
        
        //console.log(currBacteria instanceof Bacteria );
        try {
            if (newX < 0 || newY < 0 || newX >= gridWidth || newY >= gridHeight) {
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

    
    
    
}
