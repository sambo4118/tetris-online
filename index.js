const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
function getSpawnX(shape) {
    const matrixWidth = shape === "I" ? 4 : (shape === "O" ? 2 : 3);
    return Math.floor((playField.cols - matrixWidth) / 2);
}

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
        this.lockDelayStart = null;
        this.lockDelayMs = 500;
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
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
            ],
            [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
            ],
        ],
        T: [
            [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 1, 0],
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ],
            [
                [0, 1, 0],
                [1, 1, 0],
                [0, 1, 0],
            ],
        ],
        J: [
            [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 1, 1],
                [0, 1, 0],
                [0, 1, 0],
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1],
            ],
            [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0],
            ],
        ],
        L: [
            [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 1],
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0],
            ],
            [
                [1, 1, 0],
                [0, 1, 0],
                [0, 1, 0],
            ],
        ],
        S: [
            [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0],
            ],
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 0, 1],
            ],
            [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0],
            ],
            [
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
            ],
        ],
        Z: [
            [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 0, 1],
                [0, 1, 1],
                [0, 1, 0],
            ],
            [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1],
            ],
            [
                [0, 1, 0],
                [1, 1, 0],
                [1, 0, 0],
            ],
        ],
        }
        return shapes[this.shape][rotation];
    }
    get rotationNumber() {
        const shapeRotationCounts = {
            O: 1,
            I: 4,
            T: 4,
            L: 4,
            J: 4,
            S: 4,
            Z: 4,
        }
        return shapeRotationCounts[this.shape];
    }
    shapeColor() {
        const shapeColors = {
            O: "#FFD500",
            I: "#5fb0bd",
            T: "#894086",
            L: "#FF971C",
            J: "#0341AE",
            S: "#72CB3B",
            Z: "#FF3213"
        }
        return shapeColors[this.shape];
    }

    updateCells() {
        this.matrix().forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!cell) return;

                const gridX = this.x + j;
                const gridY = this.y + i;

                if (gridY < 0 || gridY >= this.grid.rows || gridX < 0 || gridX >= this.grid.cols) return;
                if (this.grid.cells[gridY][gridX] != null && this.grid.cells[gridY][gridX] != this) return;

                this.grid.cells[gridY][gridX] = this;
            })
        });
        return true;
    }

    clearCells() {
        this.matrix().forEach((row, i) => {
            row.forEach((cell, j) => {
                
                const gridX = this.x + j;
                const gridY = this.y + i;
                
                if (gridY < 0 || gridY >= this.grid.rows || gridX < 0 || gridX >= this.grid.cols) return;
                if (this.grid.cells[gridY][gridX] !== this) return;
                this.grid.cells[gridY][gridX] = null;
            })
        });
    }


    checkCollision(x = this.x, y = this.y, rotation = this.rotation) {
        for (const [i, row] of this.matrix(rotation).entries()) {
            for (const [j, cell] of row.entries()) {
                if (!cell) continue;
                const gridX = x + j;
                const gridY = y + i;
                if (gridX < 0 || gridX >= this.grid.cols || gridY >= this.grid.rows) return "grid";
                if (gridY < 0) continue;
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
            if (this.lockDelayStart === null) this.lockDelayStart = Date.now();
            if (Date.now() - this.lockDelayStart >= this.lockDelayMs) {
                this.active = false;
            }
            return;
        }

        this.lockDelayStart = null;
        this.clearCells();
        this.y += 1;
        this.updateCells();
        this.grid.drawCells();
        this.grid.drawActivePiece(this);
        
    }

    resetLockDelay() {
        this.lockDelayStart = null;
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

    drawActivePiece(piece) {
        if (!piece || !piece.active) return;
        const matrix = piece.matrix();

        if (showGhost) {
            const ghostY = getGhostY(piece);
            if (ghostY !== piece.y) {
                context.save();
                context.beginPath();
                context.rect(this.left, this.top, this.width, this.height);
                context.clip();
                context.globalAlpha = 0.25;
                matrix.forEach((row, i) => {
                    row.forEach((cell, j) => {
                        if (!cell) return;
                        const px = this.left + (piece.x + j) * this.cellSize;
                        const py = this.top + (ghostY + i) * this.cellSize;
                        context.fillStyle = piece.color;
                        context.fillRect(px, py, this.cellSize, this.cellSize);
                    });
                });
                context.restore();
            }
        }

        context.save();
        context.beginPath();
        context.rect(this.left, this.top, this.width, this.height);
        context.clip();
        matrix.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!cell) return;
                const px = this.left + (piece.x + j) * this.cellSize;
                const py = this.top + (piece.y + i) * this.cellSize;
                context.fillStyle = piece.color;
                context.fillRect(px, py, this.cellSize, this.cellSize);
            });
        });
        context.restore();
    }

    drawCells() {
        const spawnRows = 4;
        context.fillStyle = "black";
        context.fillRect(this.left, this.top - spawnRows * this.cellSize, this.width, spawnRows * this.cellSize);
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

class Score {
    constructor(context, x, y, font = "16px Arial", color = "white") {
        this.context = context;
        this.x = x;
        this.y = y;
        this.font = font;
        this.color = color;
        this.score = 0;
        this.linesCleared = 0;
        this.level = 1;
        this.displayScore = this.score;
        this.combo = -1;
        this.b2b = false;
    }

    addscore(lines) {
        if (lines === 0) {
            this.combo = -1;
            return;
        }

        const lineScores = [0, 100, 300, 500, 800];
        let base = lineScores[lines] * this.level;

        // Back-to-back bonus: consecutive Tetrises score 1.5x
        if (lines === 4 && this.b2b) {
            base = Math.floor(base * 1.5);
        }
        this.b2b = lines === 4;

        this.score += base;

        // Combo bonus: 50 * combo * level for each consecutive clear
        this.combo++;
        if (this.combo > 0) {
            this.score += 50 * this.combo * this.level;
        }

        this.linesCleared += lines;
        this.level = Math.floor(this.linesCleared / 10) + 1;
    }

    draw() {
        if (this.displayScore < this.score) {
            this.displayScore = Math.min(this.displayScore + Math.ceil((this.score - this.displayScore) / 10), this.score);
        }
        const comboText = this.combo > 0 ? `Combo x${this.combo}` : "";
        const b2bText = this.b2b ? "B2B" : "";
        const scoreMetrics = this.context.measureText(`Score: ${this.displayScore}`);
        const linesMetrics = this.context.measureText(`Lines: ${this.linesCleared}`);
        const levelMetrics = this.context.measureText(`Level: ${this.level}`);
        const comboMetrics = this.context.measureText(comboText);
        const b2bMetrics = this.context.measureText(b2bText);
        const maxWidth = Math.max(scoreMetrics.width, linesMetrics.width, levelMetrics.width, comboMetrics.width, b2bMetrics.width);
        this.context.clearRect(this.x, this.y - 20, this.x + maxWidth, this.y + 96);
        this.context.fillStyle = this.color;
        this.context.font = this.font;
        this.context.fillText(`${this.displayScore}`, this.x, this.y);
        this.context.fillText(`Lines: ${this.linesCleared}`, this.x, this.y + 24);
        this.context.fillText(`Level: ${this.level}`, this.x, this.y + 48);
        if (comboText) {
            this.context.fillStyle = "orange";
            this.context.fillText(comboText, this.x, this.y + 72);
        }
        if (b2bText) {
            this.context.fillStyle = "cyan";
            this.context.fillText(b2bText, this.x, this.y + 96);
        }
    }



}

function grabBagRandomShape(bag) {
    if (!bag || bag.length === 0) {
        const shapes = ["O", "I", "T", "L", "J", "S", "Z"];
        const shuffled = [...shapes];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        bag.push(...shuffled);
    }

    return bag.shift();
}

function holdPiece() {
    if (!canHold || !currentPiece.active) return;
    
    currentPiece.clearCells();
    const currentShape = currentPiece.shape;
    
    if (heldPieceShape === null) {
        heldPieceShape = currentShape;
        const shape = nextPieceShape;
        nextPieceShape = grabBagRandomShape(bag);
        drawNextPiece();
        currentPiece = new tetromino(shape, playField, null, getSpawnX(shape), shape === "I" ? -1 : 0);
    } else {
        const tempShape = heldPieceShape;
        heldPieceShape = currentShape;
        currentPiece = new tetromino(tempShape, playField, null, getSpawnX(tempShape), tempShape === "I" ? -1 : 0);
    }
    
    currentPiece.updateCells();
    canHold = false;
    drawHeldPiece();
    playField.drawCells();
    playField.drawActivePiece(currentPiece);
}

function getGhostY(piece) {
    let ghostY = piece.y;
    while (!piece.checkCollision(piece.x, ghostY + 1)) {
        ghostY++;
    }
    return ghostY;
}

function drawNextPiece() {
    context.fillStyle = "black";
    context.fillRect(nextGrid.left, nextGrid.top, nextGrid.width, nextGrid.height);
    nextGrid.drawBorder("grey", 1);

    if (nextPieceShape) {
        const tempPiece = new tetromino(nextPieceShape, nextGrid, null, 0, 0);
        const matrix = tempPiece.matrix(0);

        let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
        matrix.forEach((row, i) => row.forEach((cell, j) => {
            if (!cell) return;
            if (i < minRow) minRow = i;
            if (i > maxRow) maxRow = i;
            if (j < minCol) minCol = j;
            if (j > maxCol) maxCol = j;
        }));

        const filledCols = maxCol - minCol + 1;
        const filledRows = maxRow - minRow + 1;
        const startX = nextGrid.centerX - (filledCols * nextGrid.cellSize) / 2;
        const startY = nextGrid.centerY - (filledRows * nextGrid.cellSize) / 2;

        matrix.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!cell) return;
                context.fillStyle = tempPiece.color;
                context.fillRect(
                    startX + (j - minCol) * nextGrid.cellSize,
                    startY + (i - minRow) * nextGrid.cellSize,
                    nextGrid.cellSize,
                    nextGrid.cellSize
                );
            });
        });
    }
}

function drawHeldPiece() {
    context.fillStyle = "black";
    context.fillRect(holdGrid.left, holdGrid.top, holdGrid.width, holdGrid.height);
    holdGrid.drawBorder("grey", 1);

    if (heldPieceShape) {
        const tempPiece = new tetromino(heldPieceShape, holdGrid, null, 0, 0);
        const matrix = tempPiece.matrix(0);

        let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
        matrix.forEach((row, i) => row.forEach((cell, j) => {
            if (!cell) return;
            if (i < minRow) minRow = i;
            if (i > maxRow) maxRow = i;
            if (j < minCol) minCol = j;
            if (j > maxCol) maxCol = j;
        }));

        const filledCols = maxCol - minCol + 1;
        const filledRows = maxRow - minRow + 1;
        const startX = holdGrid.centerX - (filledCols * holdGrid.cellSize) / 2;
        const startY = holdGrid.centerY - (filledRows * holdGrid.cellSize) / 2;

        matrix.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!cell) return;
                context.fillStyle = tempPiece.color;
                context.fillRect(
                    startX + (j - minCol) * holdGrid.cellSize,
                    startY + (i - minRow) * holdGrid.cellSize,
                    holdGrid.cellSize,
                    holdGrid.cellSize
                );
            });
        });
    }
}

playField = new Grid(canvas.width / 2, canvas.height / 2 + 50, 20, 20, 10);
scoreCounter = new Score(context, 10, playField.top + playField.height - 48);
holdGrid = new Grid(canvas.width / 2 - 150, canvas.height / 2 - 100, 20, 4, 4);
nextGrid = new Grid(canvas.width / 2 + 150, canvas.height / 2 - 100, 20, 4, 4);

LastStepTime = Date.now();
let bag = [];
let heldPieceShape = null;
let nextPieceShape = null;
let canHold = true;
let currentPiece = null;

let gameState = "menu";
let menuSelection = 0;
const menuItems = ["Play", "Options"];
let startLevel = 1;
let showGhost = true;
let optionSelection = 0;

function startGame() {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    bag = [];
    heldPieceShape = null;
    nextPieceShape = null;
    canHold = true;
    playField.cells = Array.from({ length: playField.rows }, () => Array(playField.cols).fill(null));
    scoreCounter.score = 0;
    scoreCounter.displayScore = 0;
    scoreCounter.linesCleared = (startLevel - 1) * 10;
    scoreCounter.level = startLevel;
    scoreCounter.combo = -1;
    scoreCounter.b2b = false;
    nextPieceShape = grabBagRandomShape(bag);
    const initialShape = grabBagRandomShape(bag);
    currentPiece = new tetromino(initialShape, playField, null, getSpawnX(initialShape), initialShape === "I" ? -1 : 0);
    currentPiece.updateCells();
    LastStepTime = Date.now();
    gameState = "playing";
    playField.drawCells();
    playField.drawActivePiece(currentPiece);
    playField.drawBorder("grey", 1);
    holdGrid.drawBorder("grey", 1);
    nextGrid.drawBorder("grey", 1);
    drawHeldPiece();
    drawNextPiece();
}

function drawMenu() {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.textAlign = "center";

    context.font = "bold 48px Arial";
    context.fillStyle = "cyan";
    context.fillText("TETRIS", canvas.width / 2, canvas.height / 2 - 80);

    menuItems.forEach((item, i) => {
        const y = canvas.height / 2 - 10 + i * 44;
        const selected = i === menuSelection;
        context.font = selected ? "bold 24px Arial" : "22px Arial";
        context.fillStyle = selected ? "white" : "#888";
        if (selected) {
            context.fillText("> " + item + " <", canvas.width / 2, y);
        } else {
            context.fillText(item, canvas.width / 2, y);
        }
    });

    context.font = "13px Arial";
    context.fillStyle = "#555";
    context.fillText("Up / Down to select   Enter to confirm", canvas.width / 2, canvas.height / 2 + 130);

    context.textAlign = "left";
}

function drawOptions() {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.textAlign = "center";

    context.font = "bold 32px Arial";
    context.fillStyle = "cyan";
    context.fillText("OPTIONS", canvas.width / 2, canvas.height / 2 - 120);

    const levelSelected = optionSelection === 0;
    context.font = "20px Arial";
    context.fillStyle = levelSelected ? "white" : "#888";
    context.fillText("Start Level", canvas.width / 2, canvas.height / 2 - 40);
    context.font = levelSelected ? "bold 28px Arial" : "24px Arial";
    context.fillStyle = levelSelected ? "yellow" : "#888";
    context.fillText("< " + startLevel + " >", canvas.width / 2, canvas.height / 2);

    const ghostSelected = optionSelection === 1;
    context.font = "20px Arial";
    context.fillStyle = ghostSelected ? "white" : "#888";
    context.fillText("Ghost Piece", canvas.width / 2, canvas.height / 2 + 55);
    context.font = ghostSelected ? "bold 28px Arial" : "24px Arial";
    context.fillStyle = ghostSelected ? "yellow" : "#888";
    context.fillText(showGhost ? "ON" : "OFF", canvas.width / 2, canvas.height / 2 + 90);

    context.font = "13px Arial";
    context.fillStyle = "#555";
    context.fillText("Up / Down to select   Left / Right to change   Escape to go back", canvas.width / 2, canvas.height / 2 + 150);

    context.textAlign = "left";
}

requestAnimationFrame(loop);

function loop() {
    if (gameState === "menu") drawMenu();
    else if (gameState === "options") drawOptions();
    else if (gameState === "playing") gameLoop();
    // "paused" and "gameover" states: do nothing, overlay already drawn
    requestAnimationFrame(loop);
}

function gameOver() {
    playField.drawCells();
    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(playField.left, playField.top, playField.width, playField.height);
    context.fillStyle = "white";
    context.font = "bold 28px Arial";
    context.textAlign = "center";
    context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    context.font = "16px Arial";
    context.fillText("Press Enter to play again", canvas.width / 2, canvas.height / 2 + 32);
    context.textAlign = "left";
    gameState = "gameover";
}

function gameLoop() {
    const L = scoreCounter.level;
    const stepInterval = Math.pow(0.8 - (L - 1) * 0.007, L - 1) * 1000;
    if (Date.now() - LastStepTime > stepInterval) {
        if (!currentPiece.active) {
            const fullRows = playField.checkLines();
            if (fullRows.length > 0) {
                fullRows.forEach(row => playField.clearLine(row));
            }
            scoreCounter.addscore(fullRows.length);

            const shape = nextPieceShape;
            nextPieceShape = grabBagRandomShape(bag);
            drawNextPiece();
            const spawnY = shape === "I" ? -1 : 0;
            currentPiece = new tetromino(shape, playField, null, getSpawnX(shape), spawnY);
            if (currentPiece.checkCollision()) {
                gameOver();
                return;
            }
            currentPiece.updateCells();
            canHold = true;
            playField.drawCells();
            playField.drawActivePiece(currentPiece);
        } else {
            currentPiece.stepDown();
        }

        LastStepTime = Date.now();
    }

    scoreCounter.draw();
}

function getSRSKicks(shape, fromRotation, toRotation) {
    const jlstzKicks = {
        "0>1": [[ 0,0],[-1,0],[-1,-1],[0, 2],[-1, 2]],
        "1>0": [[ 0,0],[ 1,0],[ 1, 1],[0,-2],[ 1,-2]],
        "1>2": [[ 0,0],[ 1,0],[ 1, 1],[0,-2],[ 1,-2]],
        "2>1": [[ 0,0],[-1,0],[-1,-1],[0, 2],[-1, 2]],
        "2>3": [[ 0,0],[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],
        "3>2": [[ 0,0],[-1,0],[-1, 1],[0,-2],[-1,-2]],
        "3>0": [[ 0,0],[-1,0],[-1, 1],[0,-2],[-1,-2]],
        "0>3": [[ 0,0],[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],
    };
    const iKicks = {
        "0>1": [[ 0,0],[-2,0],[ 1,0],[-2, 1],[ 1,-2]],
        "1>0": [[ 0,0],[ 2,0],[-1,0],[ 2,-1],[-1, 2]],
        "1>2": [[ 0,0],[-1,0],[ 2,0],[-1,-2],[ 2, 1]],
        "2>1": [[ 0,0],[ 1,0],[-2,0],[ 1, 2],[-2,-1]],
        "2>3": [[ 0,0],[ 2,0],[-1,0],[ 2,-1],[-1, 2]],
        "3>2": [[ 0,0],[-2,0],[ 1,0],[-2, 1],[ 1,-2]],
        "3>0": [[ 0,0],[ 1,0],[-2,0],[ 1, 2],[-2,-1]],
        "0>3": [[ 0,0],[-1,0],[ 2,0],[-1,-2],[ 2, 1]],
    };
    const key = `${fromRotation}>${toRotation}`;
    return shape === "I" ? iKicks[key] : jlstzKicks[key];
}

document.addEventListener("keydown", (key) => {
    if (gameState === "menu") {
        if (key.key === "ArrowUp") {
            menuSelection = (menuSelection - 1 + menuItems.length) % menuItems.length;
        } else if (key.key === "ArrowDown") {
            menuSelection = (menuSelection + 1) % menuItems.length;
        } else if (key.key === "Enter") {
            if (menuSelection === 0) startGame();
            else if (menuSelection === 1) gameState = "options";
        }
        return;
    }

    if (gameState === "options") {
        if (key.key === "Escape") gameState = "menu";
        if (key.key === "ArrowUp") optionSelection = (optionSelection - 1 + 2) % 2;
        if (key.key === "ArrowDown") optionSelection = (optionSelection + 1) % 2;
        if (key.key === "ArrowLeft" || key.key === "ArrowRight") {
            if (optionSelection === 0) {
                if (key.key === "ArrowLeft") startLevel = Math.max(1, startLevel - 1);
                if (key.key === "ArrowRight") startLevel = Math.min(15, startLevel + 1);
            } else if (optionSelection === 1) {
                showGhost = !showGhost;
            }
        }
        return;
    }

    if (gameState === "gameover") {
        if (key.key === "Enter") startGame();
        return;
    }

    if (gameState === "paused") {
        if (key.key === "Escape") {
            gameState = "playing";
            LastStepTime = Date.now();
            playField.drawCells();
            playField.drawActivePiece(currentPiece);
        }
        return;
    }

    if (gameState !== "playing") return;

    if (key.key === "Escape") {
        gameState = "paused";
        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(playField.left, playField.top, playField.width, playField.height);
        context.fillStyle = "white";
        context.font = "bold 28px Arial";
        context.textAlign = "center";
        context.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        context.font = "16px Arial";
        context.fillText("Press Escape to resume", canvas.width / 2, canvas.height / 2 + 32);
        context.textAlign = "left";
        return;
    }

    if (key.key === "ArrowLeft") {
        if (currentPiece.checkCollision(currentPiece.x - 1)) return;
        if (!currentPiece.active) return;
        currentPiece.clearCells();
        currentPiece.x -= 1;
        currentPiece.resetLockDelay();
        currentPiece.updateCells();
        playField.drawCells();
        playField.drawActivePiece(currentPiece);
    }
    
    if (key.key === "ArrowRight") {
        if (currentPiece.checkCollision(currentPiece.x + 1)) return;
        if (!currentPiece.active) return;
        currentPiece.clearCells();
        currentPiece.x += 1;
        currentPiece.resetLockDelay();
        currentPiece.updateCells();
        playField.drawCells();
        playField.drawActivePiece(currentPiece);
    }
    
    if (key.key === "ArrowDown") {
        if (currentPiece.checkCollision(currentPiece.x, currentPiece.y + 1)) return;
        if (!currentPiece.active) return;
        currentPiece.clearCells();
        currentPiece.y += 1;
        currentPiece.resetLockDelay();
        currentPiece.updateCells();
        playField.drawCells();
        playField.drawActivePiece(currentPiece);
    }

    if (key.key === "ArrowUp") {
        if (!currentPiece.active) return;

        const newRotation = (currentPiece.rotation + 1) % currentPiece.rotationNumber;
        const kickOffsets = getSRSKicks(currentPiece.shape, currentPiece.rotation, newRotation);
        if (!kickOffsets) return;

        for (const [offsetX, offsetY] of kickOffsets) {
            const testX = currentPiece.x + offsetX;
            const testY = currentPiece.y + offsetY;
            
            if (!currentPiece.checkCollision(testX, testY, newRotation)) {
                currentPiece.clearCells();
                currentPiece.x = testX;
                currentPiece.y = testY;
                currentPiece.rotation = newRotation;
                currentPiece.resetLockDelay();
                currentPiece.updateCells();
                playField.drawCells();
                playField.drawActivePiece(currentPiece);
                return;
            }
        }
    }

    if (key.key === " ") {
        currentPiece.hardDrop();
            LastStepTime = 0;
    }

    if (key.key === "c" || key.key === "C") {
        holdPiece();
    }

});
    