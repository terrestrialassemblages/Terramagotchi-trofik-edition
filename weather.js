

export let sunShow = true;
export let rainShow = false;
export let sunValue = 10; 
export let rainTimeout;
let increasing = true;



export function getNextsunValue() {
  if (increasing) {
    if (sunValue < 10) {
      return sunValue++;
    } else {
      increasing = false;
      return sunValue--;
    }
  } else {
    if (sunValue > 0) {
      return sunValue--;
    } else {
      increasing = true;
      return sunValue++;
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

    
    if (sunValue<3){
        // Set the new opacity
        div.style.opacity = 0.5;
        div2.style.opacity = 0.6;
    }
    else if(sunValue>6){
        div.style.opacity = 0;
        div2.style.opacity = 0;
    }
    

}

setInterval(() => {
    rainShow = true;  // Start rain
    sunShow = false;

    rainTimeout = setTimeout(() => {
        rainShow = false;  // Stop rain after 10s
    }, 10 * 1000);

    setTimeout(() => {
        sunShow = true;  // Show sun after 13s (10s rain + 3s nothing)
    }, 13 * 1000);

}, 27 * 1000);

