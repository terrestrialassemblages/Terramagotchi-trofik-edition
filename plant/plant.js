
export default class Plant {
    constructor(startingY, startingX, root) {
        this.startingY = startingY;
        this.startingX = startingX;
        this.root = root; 
        this.heightMatrix = [];

    }

    grow(rootLength, pattern) {
        this.patternHeight = Math.min(rootLength, pattern.length);
        this.heightMatrix = pattern.slice(0, this.patternHeight);
    }


}

