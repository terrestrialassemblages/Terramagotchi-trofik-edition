
export default class Plant {
    constructor(startingY, startingX, root) {
        this.startingY = startingY;
        this.startingX = startingX;
        this.root = root; 
        this.height = 0; 
    }

    grow() {
        this.height = this.root.length * 2; 
    }

    setHeight(height) {
        this.height = height;
    }
}
