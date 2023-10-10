

export function waterBehavior(y, x, grid, gridHeight) {
    // Check for an empty space below and move water down
    if (y + 1 < gridHeight && grid[y + 1][x] === null) {
        grid[y + 1][x] = 'water';
        grid[y][x] = null;
    } else {
        grid[y][x] = null;
    }
}