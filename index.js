const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

class tetromino {
    constructor(shape, grid, color, gridX, gridY, rotation = 0, texture = null) {
        this.x = gridX;
        this.y = gridY;
        this.shape = shape;
        this.grid = grid;
        this.rotation = rotation;
        if (!texture) {
            this.color = color;
        } else {
            this.loadTexture(texture);
        }
        this.active = true;
        this.lockDelaySteps = 0;
        this.maxLockDelaySteps = 3;
        if (!this.color && !this.texture) {
            this.color = this.shapeColor();
        }
    }

    loadTexture(texture) {
        // todo: load texture
    }

    matrix(rotation = this.rotation) {
        const shapes = {
        O: [[
            [1, 1],
            [1, 1],
        ]],
        I: [
            [
                [1, 1, 1, 1]
            ],
            [
                [1],
                [1],
                [1],
                [1]
            ]
        ],
        T: [
            [
                [0, 1, 0],
                [1, 1, 1]
            ],
            [
                [1, 0],
                [1, 1],
                [1, 0]
            ],
            [
                [1, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 1],
                [1, 1],
                [0, 1]
            ]
        ],
        L: [
            [
                [1, 0],
                [1, 0],
                [1, 1]
            ],
            [
                [0, 0, 1],
                [1, 1, 1]
            ],
            [
                [1, 1],
                [0, 1],
                [0, 1]
            ],
            [
                [1, 1, 1],
                [1, 0, 0]
            ]
        ],
        J: [
            [
                [0, 1],
                [0, 1],
                [1, 1]
            ],
            [
                [1, 1, 1],
                [0, 0, 1]
            ],
            [
                [1, 1],
                [1, 0],
                [1, 0]
            ],
            [
                [1, 0, 0],
                [1, 1, 1]
            ]
        ],
        S: [
            [
                [0, 1, 1],
                [1, 1, 0]
            ],
            [
                [1, 0],
                [1, 1],
                [0, 1]
            ]
        ],
        Z: [
            [
                [1, 1, 0],
                [0, 1, 1]
            ],
            [
                [0, 1],
                [1, 1],
                [1, 0],
            ]
            ]
        }
        return shapes[this.shape][rotation];
    }
    get rotationNumber() {
        const shapeRotationCounts = {
            O: 1,
            I: 2,
            T: 4,
            L: 4,
            J: 4,
            S: 2,
            Z: 2
        }
        return shapeRotationCounts[this.shape];
    }
    shapeColor() {
        const shapeColors = {
            O: "yellow",
            I: "cyan",
            T: "purple",
            L: "orange",
            J: "blue",
            S: "green",
            Z: "red"
        }
        return shapeColors[this.shape];
    }

    updateCells() {
        this.matrix().forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!cell) return;

                const gridX = this.x + j;
                const gridY = this.y + i;

                if (this.grid.cells[gridY][gridX] != null && this.grid.cells[gridY][gridX] != this) return;
                
                if (
                        gridY >= 0 &&
                        gridY < this.grid.rows &&
                        gridX >= 0 && 
                        gridX < this.grid.cols
                    ) {
                    this.grid.cells[gridY][gridX] = this;
                }
                

            })
        });
        return true;
    }

    clearCells() {
        this.matrix().forEach((row, i) => {
            row.forEach((cell, j) => {
                
                const gridX = this.x + j;
                const gridY = this.y + i;
                
                if (this.grid.cells[gridY][gridX] !== this) return;

                if (
                        gridY >= 0 &&
                        gridY < this.grid.rows &&
                        gridX >= 0 && 
                        gridX < this.grid.cols
                    ) {
                    this.grid.cells[gridY][gridX] = null;
                }
            })
        });
    }


    checkCollision(x = this.x, y = this.y, rotation = this.rotation) {
        for (const [i, row] of this.matrix(rotation).entries()) {
            for (const [j, cell] of row.entries()) {
                if (!cell) continue;
                const gridX = x + j;
                const gridY = y + i;
                if (gridX < 0 || gridX >= this.grid.cols || gridY < 0 || gridY >= this.grid.rows) return "grid";
                const occupant = this.grid.cells[gridY][gridX];
                if (occupant !== null && occupant !== this) return occupant;
            }
        }
        return null;
    }

    stepDown() {
    
        if (!this.active) return;

        const canMove = !this.checkCollision(this.x, this.y + 1);
        
        if (!canMove) {
            this.lockDelaySteps++;
            if (this.lockDelaySteps >= this.maxLockDelaySteps) {
                this.active = false;
            }
            return;
        }

        this.clearCells();
        this.y += 1;
        this.updateCells();
        this.grid.drawCells();
        
    }

    resetLockDelay() {
        this.lockDelaySteps = 0;
    }

    hardDrop() {
        if (!this.active) return;
        
        this.clearCells();
        while (!this.checkCollision(this.x, this.y + 1)) {
            this.y += 1;
        }
        this.updateCells();
        this.grid.drawCells();
        this.active = false;
    }

}


class Grid {
    constructor(centerX, centerY, cellSize, rows, cols, color = "grey") {
        this.centerX = centerX;
        this.centerY = centerY;
        this.cellSize = cellSize;
        this.rows = rows;
        this.cols = cols;
        this.color = color;
        this.cells = Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    drawBorder(color = this.color, width = 1) {
        context.strokeStyle = color;
        context.lineWidth = width;
        context.strokeRect(this.left, this.top, this.width, this.height);
    }

    get left() {
        return this.centerX - (this.cols * this.cellSize) / 2;
    }

    get top() {
        return this.centerY - (this.rows * this.cellSize) / 2;
    }

    get width() {
        return this.cols * this.cellSize;
    }

    get height() {
        return this.rows * this.cellSize;
    }

    clearLine(rowNumber) {
        this.cells.splice(rowNumber, 1);
        this.cells.unshift(Array(this.cols).fill(null));
    }

    checkLines() {
        const fullRows = [];
        for (let i = 0; i < this.rows; i++) {
            const row = this.cells[i];
            const isFull = row.every(cell => cell !== null && !cell.active);
            if (isFull) {
                fullRows.push(i);
            }
        }
        return fullRows;
    }

    drawCells() {
        this.drawBorder("grey", 1);
        this.cells.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell) {
                    context.fillStyle = cell.color;
                    context.fillRect(
                        this.left + j * this.cellSize,
                        this.top + i * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
                if (!cell) {
                    context.fillStyle = "black";
                    context.fillRect(
                        this.left + j * this.cellSize,
                        this.top + i * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            });
        });
    }
}

function grabBagRandomShape(bag) {
    if (!bag || bag.length === 0) {
        const shapes = ["O", "I", "T", "L", "J", "S", "Z"];
        bag.push(...shapes, ...shapes);
    }

    const randomIndex = Math.floor(Math.random() * bag.length);
    
    return bag.splice(randomIndex, 1)[0];
}

playField = new Grid(canvas.width / 2, canvas.height / 2 + 50, 20, 20, 10);
playField.drawBorder("grey", 1);

// Hold grid - small 4x4 grid on the left side
holdGrid = new Grid(canvas.width / 2 - 200, canvas.height / 2 - 100, 20, 4, 4);
holdGrid.drawBorder("grey", 1);

LastStepTime = Date.now();
let bag = [];
let heldPieceShape = null;
let canHold = true;

let currentPeice = new tetromino(grabBagRandomShape(bag), playField, "red", 4, 0);
currentPeice.updateCells();

drawHeldPiece();

requestAnimationFrame(gameLoop);

function drawHeldPiece() {
    holdGrid.cells = Array.from({ length: 4 }, () => Array(4).fill(null));
    
    if (heldPieceShape) {
        const tempPiece = new tetromino(heldPieceShape, holdGrid, null, 0, 0);
        tempPiece.active = false;
        tempPiece.updateCells();
    }
    
    holdGrid.drawCells();
}

function holdPiece() {
    if (!canHold || !currentPeice.active) return;
    
    currentPeice.clearCells();
    const currentShape = currentPeice.shape;
    
    if (heldPieceShape === null) {
        // First hold - store current piece and spawn new one
        heldPieceShape = currentShape;
        const shape = grabBagRandomShape(bag);
        currentPeice = new tetromino(shape, playField, null, 4, 0);
    } else {
        // Swap current piece with held piece
        const tempShape = heldPieceShape;
        heldPieceShape = currentShape;
        currentPeice = new tetromino(tempShape, playField, null, 4, 0);
    }
    
    currentPeice.updateCells();
    canHold = false;
    drawHeldPiece();
    playField.drawCells();
}

function gameLoop() {
    console.log("loop");
    if (Date.now() - LastStepTime > 500) {
        if (!currentPeice.active) {
            const shape = grabBagRandomShape(bag);
            currentPeice = new tetromino(shape, playField, null, 4, 0);
            currentPeice.updateCells();
            canHold = true; // Reset hold ability for new piece
        }
        
        currentPeice.stepDown();

        LastStepTime = Date.now();
    }
    
    if (playField.checkLines().length > 0) {
        playField.checkLines().forEach(row => playField.clearLine(row));
        playField.drawCells();
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (key) => {
    if (key.key === "ArrowLeft") {
        if (currentPeice.checkCollision(currentPeice.x - 1)) return;
        if (!currentPeice.active) return;
        currentPeice.clearCells();
        currentPeice.x -= 1;
        currentPeice.resetLockDelay();
        currentPeice.updateCells();
        playField.drawCells();
    }
    
    if (key.key === "ArrowRight") {
        if (currentPeice.checkCollision(currentPeice.x + 1)) return;
        if (!currentPeice.active) return;
        currentPeice.clearCells();
        currentPeice.x += 1;
        currentPeice.resetLockDelay();
        currentPeice.updateCells();
        playField.drawCells();
    }
    
    if (key.key === "ArrowDown") {
        if (currentPeice.checkCollision(currentPeice.x, currentPeice.y + 1)) return;
        if (!currentPeice.active) return;
        currentPeice.clearCells();
        currentPeice.y += 1;
        currentPeice.resetLockDelay();
        currentPeice.updateCells();
        playField.drawCells();
    }

    if (key.key === "ArrowUp") {
        if (!currentPeice.active) return;

        const newRotation = (currentPeice.rotation + 1) % currentPeice.rotationNumber;
        
        const kickOffsets = [
            [0, 0],
            [-1, 0], 
            [1, 0],
            [2, 0],
            [-2, 0],
            [0, -1],
            [-1, -1],
            [1, -1],
            [2, -1],
            [0, -2],
        ];

        for (const [offsetX, offsetY] of kickOffsets) {
            const testX = currentPeice.x + offsetX;
            const testY = currentPeice.y + offsetY;
            
            if (!currentPeice.checkCollision(testX, testY, newRotation)) {

                currentPeice.clearCells();
                currentPeice.x = testX;
                currentPeice.y = testY;
                currentPeice.rotation = newRotation;
                currentPeice.resetLockDelay();
                currentPeice.updateCells();
                playField.drawCells();
                return;
            }
        }
    }

    if (key.key === " ") {
        currentPeice.hardDrop();
    }

    if (key.key === "c" || key.key === "C") {
        holdPiece();
    }

});
    