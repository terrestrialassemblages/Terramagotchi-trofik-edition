import { grid } from "../sandSim.js";


export default class Plant {
    constructor(startingY, startingX, root) {
        this.startingY = startingY;
        this.startingX = startingX;
        this.currY = startingY;
        this.currX = startingX;
        this.root = root; 
        this.height = 0;
        
        // Change direction after 2-3 steps
        this.step = Math.floor(Math.random() * 4) + 2;

        this.branches = [];
    }

    grow() {
        if (this.height < this.root.length) {
            //If plant has room to grow, grow
            if (this.currY >= 20) {

                // Plant grows straight up for 2-5 steps then changes directions
                if (this.step == 0) {
                    // If step is 0 then change directions
                    const directions = [-1, 1]; // Allow growth in -1 (left), 0 (straight), or 1 (right) direction
                    let randomDirection = directions[Math.floor(Math.random() * directions.length)];

                    const nextX = this.currX + randomDirection;

                    // Restrict so plant can only grow 2 blocks in either x direction from the starting point
                    if (nextX > this.startingX + 2 || nextX < this.startingX - 2) {
                        // If nextX is out of bounds, reverse directions
                        randomDirection = -randomDirection;
                    }
                    // // Create a branch with leaves
                    //this.branch(this.currY, this.currX, -randomDirection);

                    let branch = new Branch(this.currY, this.currX, this, -randomDirection);
                    this.branches.push(branch);

                    this.currX += randomDirection;
                    this.currY--;

                    
                    // Reset step to a new random number between 4-6
                    this.step = Math.floor(Math.random() * 3) + 4;
                } else {
                    // Keep growing straight up
                    this.currY--;
                    this.step--;
                }
                grid[this.currY][this.currX] = 'plant';

                this.height++;

                console.log("Plant height: " + this.height);
            }
            // Grow branches
            console.log("grow BRANCH");
            for (let i=0; i < this.branches.length; i++) {
                this.branches[i].growBranch();
            }
        }
    }

    setHeight(height) {
        this.height = height;
    }



    branch(y, x, branchDir) {
        // IMPLEMENT HERE
        y--;
        x += branchDir;

        grid[y][x] = 'plant';
        grid[y][x + branchDir] = 'plant';
        grid[y-1][x + (2 * branchDir)] = 'plant';
        grid[y-1][x + (3 * branchDir)] = 'plant';

        grid[y+1][x + (2 * branchDir)] = 'yellowFlower';

        grid[y-1][x + (4 * branchDir)] = 'redFlower';
        grid[y-1][x + (5 * branchDir)] = 'redFlower';
        grid[y-1][x + (6 * branchDir)] = 'redFlower';
        grid[y][x + (4 * branchDir)] = 'redFlower';
        grid[y][x + (5 * branchDir)] = 'redFlower';
        grid[y+1][x + (4 * branchDir)] = 'redFlower';
    }
}

class Branch {
    constructor(y, x, plant, branchDir) {
        this.startY = y - 1;
        this.startX = x + branchDir;
        this.currY = this.startY;
        this.currX = this.startX;
        this.plant = plant
        this.branchDir = branchDir;
        this.length = 0;

        this.flowerPositions = []
        this.currentBloom = 0;

        // Thresholds for flower blooming
        this.firstBloomThreshold = 10;
        this.secondBloomThreshold = 20;

        // Number of steps before branch grows up
        this.currStep = this.plant.height < 10 ? 2 : 1;

        grid[this.currY][this.currX] = 'plant';
    }

    growBranch() {

        // If branch is grown then generate flowers instead
        if (this.currStep == 0 && (this.startY - this.currY) > 0) {

            // First stage of flowers (small yellow flowers)
            if (this.currentBloom == 0 && this.plant.height >= this.firstBloomThreshold) {
                console.log("FIRST BLOOM", this.plant.height)
                for (let i=0; i < this.flowerPositions.length; i++) {
                    let flowerY = this.flowerPositions[i][0];
                    let flowerX = this.flowerPositions[i][1];

                    grid[flowerY][flowerX] = 'yellowFlower';  
                }
                this.currentBloom++;
                return;
            
                // Second stage of flowers (red flower bloom)
            } else if (this.currentBloom > 0 && this.plant.height >= this.secondBloomThreshold) {

                // Red flowers hardcoded to grow to full size after 2 seconds
                grid[this.currY + 1][this.currX + this.branchDir] = 'redFlower';
                
                setTimeout(() => {
                    grid[this.currY + 1][this.currX + (2 * this.branchDir)] = 'redFlower';
                    grid[this.currY + 2][this.currX + this.branchDir] = 'redFlower';
                    setTimeout(() => {
                        grid[this.currY + 1][this.currX + (3 * this.branchDir)] = 'redFlower';
                        grid[this.currY + 2][this.currX + (2 * this.branchDir)] = 'redFlower';
                        grid[this.currY + 3][this.currX + this.branchDir] = 'redFlower';

                    }, 1000);

                }, 1000);
                this.flowerStage++;
            }
            return;
        }
        

        // Grow branch sideways
        if (this.currStep > 0) {
            this.currX += this.branchDir;

            grid[this.currY][this.currX] = 'plant';
            this.currStep--;
        
        // Grow branch upwards
        } else {
            this.currY--;
            this.currX += this.branchDir;

            grid[this.currY][this.currX] = 'plant';

            this.flowerPositions.push([this.currY + 2, this.currX]);
            this.currStep = 1;
        }

    }
}

