import { elements } from '../sandSim.js';
import Aggregate from './aggregate.js';
import { grid } from '../sandSim.js';

// In aggregate_behavior.js
import('../sandSim.js').then((module) => {
    const { elements } = module;
    // Your code here
    elements.aggregate.behavior.push(function(y, x, grid) {
    
        let currAggr = findAggregateByPosition(elements.aggregate.aggregateElements, x, y);
    
        if (grid[y][x] === 'aggregate') {
            const [isNear, aggrCount, hasMoreAggre] = currAggr.ifNearOtherAgg(5, grid);
    
            //const num = currAggr.getAggregateCount(y, x, grid);
    
            //console.log("aggregate number: ", aggrCount)
            //updateSoilAlpha(y, x, aggrCount)
    
            if (aggrCount >= 2 && hasMoreAggre){
                updateSoilcolor(y, x, aggrCount)
            }
    
            //console.log("result", result)
            if (isNear){
                if (!currAggr.hasGrow){
                    generateSoil(y, x, isNear);
                    currAggr.hasGrow = true;
                }
            }
        }
    });
});

export function generateSoil(y, x, macro = false) {
    let caseNum = Math.floor(Math.random() * 4);
    if (macro == false){
        if (caseNum == 0){

            let aggInstance1 = new Aggregate(y, x+1, null, null);
            let aggInstance2 = new Aggregate(y-1, x+1, null, null);
            let aggInstance3 = new Aggregate(y-1, x, null, null);

            elements.aggregate.aggregateElements[y + "," + (x+1)] = aggInstance1;
            elements.aggregate.aggregateElements[(y-1) + "," + (x+1)] = aggInstance2;
            elements.aggregate.aggregateElements[(y-1) + "," + x] = aggInstance3;

            if(grid[y][x+1] == 'soil'){
                grid[y][x+1] = 'aggregate';  
            }
            if(grid[y-1][x+1] == 'soil'){
                grid[y-1][x+1] = 'aggregate';  
            }
            if(grid[y-1][x] == 'soil'){
                grid[y-1][x] = 'aggregate';  
            }
            return;     
        }
        else{
            let aggInstance1 = new Aggregate(y, x+1, null, null);
            elements.aggregate.aggregateElements[y + "," + (x+1)] = aggInstance1;
            grid[y][x+1] = 'aggregate';  
            return;  
        }
    }

    if (macro == true){
        let aggregateSizeX = Math.floor(Math.random() * 2) + 2;
        let aggregateSizeY = Math.floor(Math.random() * 2) + 1;

        const rotationAngle = Math.random() * Math.PI * 2;

                //const rotationAngle = Math.random() * Math.PI * 2;
                for (let i = 0; i < aggregateSizeX; i++) {
                    for (let j = 0; j < aggregateSizeY; j++) {
                        const aggregateX = x + i;
                        const aggregateY = y - j;
                        // Calculate elliptical values with increased noise
                        const noise = Math.random() * 0.3 - 0.15;
                        let ellipseX = (i - aggregateSizeX / 2 + noise) / (aggregateSizeX / 2);
                        let ellipseY = (j - aggregateSizeY / 2 + noise) / (aggregateSizeY / 2);
                        // Rotate the coordinates
                        const rotatedX = ellipseX * Math.cos(rotationAngle) - ellipseY * Math.sin(rotationAngle);
                        const rotatedY = ellipseX * Math.sin(rotationAngle) + ellipseY * Math.cos(rotationAngle);
                        // Use the elliptical equation to determine if a pixel is inside the ellipse
                        if (rotatedX * rotatedX + rotatedY * rotatedY <= 1) {
                            if (rotatedX * rotatedX + rotatedY * rotatedY <= 1 && grid[aggregateY][aggregateX] == 'soil') {
                                let aggInstance = new Aggregate(aggregateY, aggregateX, null, null);
                                elements.aggregate.aggregateElements[aggregateY + "," + aggregateX] = aggInstance;
                                grid[aggregateY][aggregateX] = 'aggregate';          
                                
                                aggInstance.hasGrow = true;
                            }
                        }
                    }
                }
            }
}

export function calculateSoilColor(color1, color2, alpha) {

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

export function findAggregateByPosition(aggregateElements, x, y) {

    if (aggregateElements[y + "," + x] !== undefined) {
        return aggregateElements[y + "," + x];
    }
      
    return null;  // Return null if no matching bacteria is found
}

export function updateSoilcolor(y, x, aggrCount, init = false) {
    let adjustSize = Math.floor(Math.random() * 10);
    let aggregateSizeX = Math.floor(Math.random() * 2) + adjustSize;
    let aggregateSizeY = Math.floor(Math.random() * 2) + adjustSize;

    if(init == true){
        aggregateSizeX = Math.floor(Math.random() * 2) + 20;
        aggregateSizeY = Math.floor(Math.random() * 2) + 20;
    }

    const rotationAngle = Math.random() * Math.PI * 2;

    // Calculate the start and end points to make (y, x) the center
    const startX = x - Math.floor(aggregateSizeX / 2);
    const startY = y - Math.floor(aggregateSizeY / 2);
    const endX = startX + aggregateSizeX;
    const endY = startY + aggregateSizeY;

    for (let aggregateX = startX; aggregateX < endX; aggregateX++) {
        for (let aggregateY = startY; aggregateY < endY; aggregateY++) {
            const i = aggregateX - x;
            const j = aggregateY - y;
            
            // Calculate elliptical values with increased noise
            const noise = Math.random() * 0.3 - 0.15;
            let ellipseX = (i + noise) / (aggregateSizeX / 2);
            let ellipseY = (j + noise) / (aggregateSizeY / 2);
            
            // Rotate the coordinates
            const rotatedX = ellipseX * Math.cos(rotationAngle) - ellipseY * Math.sin(rotationAngle);
            const rotatedY = ellipseX * Math.sin(rotationAngle) + ellipseY * Math.cos(rotationAngle);

            const distanceFromCenter = rotatedX * rotatedX + rotatedY * rotatedY;
            const inEllipse = distanceFromCenter <= 1;

            // Use a smoother function for the drawing probability
            const probability = Math.random();
            const threshold = 1 - Math.pow(distanceFromCenter, 0.5);

            if (inEllipse && probability < threshold) {
                if (grid[aggregateY][aggregateX] === 'soil' && init == true){
                    updateInitialAlpha(aggregateY, aggregateX, aggregateY);
                }
                if (grid[aggregateY][aggregateX] === 'soil'&& init == false) {
                    //grid[aggregateY][aggregateX] = 'darkSoil';
                    updateSoilAlpha(aggregateY, aggregateX, aggrCount)
                }
            }
        }
    }
}

export function updateSoilAlpha(y, x, aggrCount) {
    if (aggrCount >= 2) {
        let targetAlpha = 1 - (aggrCount - 2) * 0.05;
        targetAlpha = Math.min(Math.max(targetAlpha, 0), 0.8);  // Boundaries between 0 and 0.95

        if (elements.soil.soilAlpha[y + "," + x] > targetAlpha) {
            elements.soil.soilAlpha[y + "," + x] = targetAlpha;
        }
    }
}

export function updateInitialAlpha(y, x, height) {
    
        // Normalize height to a 0-70 scale (150-80)
        height = height - 80;

        // Scale alpha so it's smaller when height is smaller
        let targetAlpha = 0.7 + height * (1 - 0.7) / 40;

        // Set boundaries between 0.8 and 1
        targetAlpha = Math.min(Math.max(targetAlpha, 0.7), 1); 

        if (elements.soil.soilAlpha[y + "," + x] > targetAlpha) {
            elements.soil.soilAlpha[y + "," + x] = targetAlpha;
        }
}

export function initSoilGradient(){
    for (let i = 80; i < 120; i+=10) {
        for (let j = 0; j < 200; j+=5) {
            updateSoilcolor(i,j,0,true);
        }
    }
}