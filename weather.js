

export let sunShow = true;
export let rainShow = false;
export let sunValue = 30; 

const minDiameter = 5; 
const maxDiameter = 30; 

export function changeRainShow(boolean) {
    rainShow = boolean;
}
export function changeSunShow(boolean) {
    sunShow = boolean;
}

export function drawSun(ctx, canvas, pixelSize) {
    if (sunShow) {
        var div = document.querySelector('.gradient-layer2');
        // Set the new opacity
        div.style.opacity = 0;

        
        let sunPixels = [
            "      X       ",
            "   X XX XXX   ",
            "   XXXXXXX    ",
            " X XX....XXXX ",
            " XXX......XX  ",
            " XX........XX ",
            "  X........XXX",
            "XXX........X  ",
            " XX........XX ",
            "  XX......XXX ",
            " XXXX....XX X ",
            "    XXXXXXX   ",
            "   XXX XX X   ",
            "       X      ",
        ];
        /*
        const diameter = minDiameter + (maxDiameter - minDiameter) * (sunValue / 100);
        const radius = diameter / 2;
        const sunPixels = [];

        for (let y = 0; y < diameter; y++) {
            let row = '';
            for (let x = 0; x < diameter; x++) {
                const distanceToCenter = Math.sqrt((x - radius) ** 2 + (y - radius) ** 2);
                if (
                    (distanceToCenter >= radius - 1 && distanceToCenter <= radius + 1) //A circle outside the centre circle
                ) {
                    row += 'X'; 
                } else {
                    row += (distanceToCenter < radius) ? '.' : ' '; //The centre part of the sun is '.', and ' ' in the rest of the sun
                }
            }
            sunPixels.push(row);
        }
        */
        let startX = (canvas.width - (sunPixels[0].length * pixelSize)) + 30;
        let startY = 0;

        for (let y = 0; y < sunPixels.length; y++) {
            for (let x = 0; x < sunPixels[y].length; x++) {
                switch (sunPixels[y][x]) {
                    case 'X':
                        ctx.fillStyle = 'orange';
                        break;
                    case '.':
                        ctx.fillStyle = 'yellow';
                        break;
                    default:
                        ctx.fillStyle = 'transparent';
                        break;
                }
                ctx.fillRect(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize);
            }
        }
    }
}

export function generateRain(grid, gridWidth) {
    if (rainShow) {
        var div = document.querySelector('.gradient-layer2');
        // Set the new opacity
        div.style.opacity = 1;


        
        if (Math.random() < 0.8) {
            let x = Math.floor(Math.random() * gridWidth);
            let raindropLength = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3

            for (let i = 0; i < raindropLength; i++) {
                if (grid[i][x] === null) {
                    grid[i][x] = 'water';
                }
            }
        }
    }
}


setInterval(() => {
    rainShow = true;  // Start rain
    sunShow = false;

    setTimeout(() => {
        rainShow = false;  // Stop rain after 10s
    }, 10 * 1000);

    setTimeout(() => {
        sunShow = true;  // Show sun after 15s (10s rain + 3s nothing)
    }, 13 * 1000);

}, 27 * 1000);

