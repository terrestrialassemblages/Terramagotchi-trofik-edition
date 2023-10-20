
export default class Plant {
    constructor(startingY, startingX, root, pattern) {
        this.startingY = startingY;
        this.startingX = startingX;
        this.root = root; 
        this.heightMatrix = [];
        this.pattern = pattern;  // Store the chosen pattern
    }

    grow(rootLength) {
        this.patternHeight = Math.min(rootLength / 2, this.pattern.length);
        this.heightMatrix = this.pattern.slice(0, this.patternHeight);
    }
}

