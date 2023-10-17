

export let sunShow = true;
export let rainShow = false;
export let sunValue = 10; 
export let rainTimeout;
export let rainInterval = 30000;
let increasing = true;
let stayingCounter = 0;

/*
let rainCycle = setInterval(() => {
    rainShow = true;  // Start rain
    sunShow = false;

    rainTimeout = setTimeout(() => {
        rainShow = false;  // Stop rain after 10s
    }, 10 * 1000);

    setTimeout(() => {
        sunShow = true;  // Show sun after 12s (10s rain + 2s nothing)
    }, 12 * 1000);
}, rainInterval);
*/
export function setTime() {
    if (sunValue >= 5){
        sunValue = 0;
        increasing = false;
    }
    else{
        increasing = true;
        sunValue = 10;
    }
}


export function getRandomRainInterval() {
    // Generate a random rain interval between 30 and 60 seconds
    return Math.floor(Math.random() * (60000 - 30000 + 1) + 30000);
}

export function getNextsunValue() {
    // When the value is 0 or 10
    if (sunValue === 0 || sunValue === 10) {
        // Increment the counter
        stayingCounter++;
        
        
        // If counter reaches 30, reset it and proceed
        if (stayingCounter >= 10) {
            //console.log("counter: ", stayingCounter)
            stayingCounter = 0; // Reset the counter
            
            //console.log("counter: ", stayingCounter)
            // Proceed to the next value
            if (increasing) {
                //console.log("increasing")
                increasing = false;
                return --sunValue;
            } else {
                increasing = true;
                return ++sunValue;
            }
        } else {
            
            // Stay in the current state
            return sunValue;
        }
    }
    
    // Regular increasing and decreasing logic
    if (increasing) {
        if (sunValue < 10) {
            return ++sunValue;
        } else {
            increasing = false;
            return --sunValue;
        }
    } else {
        if (sunValue > 0) {
            return --sunValue;
        } else {
            increasing = true;
            return ++sunValue;
        }   
    }
}

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
        /*
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
        
        let startX = (canvas.width - (sunPixels[0].length * pixelSize)) + 30;
        let startY = 0;

        for (let y = 0; y < sunPixels.length; y++) {
            for (let x = 0; x < sunPixels[y].length; x++) {
                let i = startX + x * sunValue;
                let j = startY + y * sunValue;
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
                ctx.fillRect(i, j, sunValue, sunValue);
            }
        }*/
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

export function sunlight(){
    //sunValue = 5; // Replace this with your actual sunValue

    // Ensure sunValue is within the range of 0 to 10
    sunValue = Math.min(10, Math.max(0, sunValue));

    // Calculate the opacity value based on sunValue (inverse relationship)
    //var opacityValue = (10 - sunValue) / 20; // Subtract from 10 and divide by 20

    // Select the element with the class "gradient-layer2"
    var div = document.querySelector(".layer-night");
    var div2 = document.querySelector('.layer-night-multiply');

    var opacity = (10 - sunValue) * 0.05; // Range is 0 to 0.5
    var opacityBg = (10 - sunValue) * 0.1; // Range is 0 to 1.0
    div.style.opacity = opacityBg;
    div2.style.opacity = opacity;

}

/*
export function startRainCycle() {
    rainShow = true; // Start rain
    sunShow = false;
  
    rainTimeout = setTimeout(() => {
      rainShow = false; // Stop rain after 10s
    }, 10 * 1000);

    setTimeout(() => {
        changeSunShow(true); // Show sun after 12s (10s rain + 2s nothing)
      }, 12 * 1000);
  
    // Clears the previous timer and resets the next rain cycle
    clearInterval(rainCycle);
    rainCycle = setInterval(startRainCycle, rainInterval);
    console.log('rainInterval: ', rainInterval);
}
*/

setInterval(() => {
    rainShow = true;  // Start rain
    sunShow = false;

    rainTimeout = setTimeout(() => {
        rainShow = false;  // Stop rain after 10s
    }, 10 * 1000);

    setTimeout(() => {
        sunShow = true;  // Show sun after 12s (10s rain + 2s nothing)
    }, 12 * 1000);

}, 27 * 1000);

