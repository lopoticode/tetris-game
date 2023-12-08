let canvas = document.getElementById("tetriste");
canvas.width = 300;
canvas.height = 660;

let shapes = {
    square: [[1, 1],
        [1, 1]],
    line: [[1],
        [1],
        [1],
        [1]],
    l: [[1, 0],
        [1, 0],
        [1, 1]],
    reverseL: [[0, 1],
        [0, 1],
        [1, 1]],
    s: [[0, 1, 1],
        [1, 1, 0]],
    reverseS: [[1, 1, 0],
        [0, 1, 1]],
    t: [[0, 1, 0],
        [1, 1, 1]]
};
class Case {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

class Piece {
    constructor(x, y, color, shape) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.shape = shape;
        this.typeShape = Object.keys(shapes).find(key => shapes[key] === shape);
    }
}

class Game {
    constructor() {
        this.init();
    }

    init() {
        this.isStarted = false;
        this.board = [];
        this.pieces = [];
        this.score = 0;
        this.lines = 0;
        this.nextPiece = null;
        this.currentPiece = null;
        this.intervalId = null;

        this.createBoard();
        this.drawBoard()
        let piece = this.createPiece();
        this.currentPiece = piece;
        this.pieces.push(piece);
        this.updateNextPiece();
    }

    createBoard() {
        for (let y = 0; y < 22; y++) {
            this.board[y] = [];
            for (let x = 0; x < 10; x++) {
                this.board[y][x] = new Case(x, y, "white");
            }
        }
    }

    createPiece() {
        let shapesKeys = Object.keys(shapes);
        let random = Math.floor(Math.random() * shapesKeys.length);
        let shape = shapes[shapesKeys[random]];

        let colors = ["red", "blue", "green", "pink", "purple"];
        random = Math.floor(Math.random() * colors.length);
        let color = colors[random];

        let x = (Math.floor(Math.random() * 9) + shape[0].length) % (9 - shape[0].length);

        return new Piece(x, 0, color, shape);
    }

    drawBoard() {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        for (let y = 0; y < 22; y++) {
            for (let x = 0; x < 10; x++) {
                ctx.fillStyle = this.board[y][x].color;
                ctx.fillRect(x * 30 + 1, y * 30 + 1, 28, 28);
            }
        }
        ctx.stroke();
    }

    drawPiece(piece) {
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = piece.color;
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] === 1) {
                    ctx.fillRect((piece.x + x) * 30 + 1, (piece.y + y) * 30 + 1, 28, 28);
                }
            }
        }
    }

    movePieceDown() {
        if (this.currentPiece.y + this.currentPiece.shape.length <= 22) {
            this.currentPiece.y++;
        }

        if (this.checkCollision()) {
            this.currentPiece.y--;
            return false;
        }
        return true;
    }

    movePieceLeft() {
        if (this.currentPiece.x > 0) {
            this.currentPiece.x--;
        }

        if (this.checkCollision()) {
            this.currentPiece.x++;
        }
    }

    movePieceRight() {
        if (this.currentPiece.x + this.currentPiece.shape[0].length < 10) {
            this.currentPiece.x++;
        }

        if (this.checkCollision()) {
            this.currentPiece.x--;
        }
    }

    rotatePiece() {
        let shape = this.currentPiece.shape;
        let newShape = [];
        for (let x = 0; x < shape[0].length; x++) {
            newShape[x] = [];
            for (let y = shape.length - 1; y >= 0; y--) {
                newShape[x][shape.length - 1 - y] = shape[y][x];
            }
        }

        // check if the piece can be rotated without collision with the board and other pieces
        for (let y = 0; y < newShape.length; y++) {
            for (let x = 0; x < newShape[y].length; x++) {
                if (newShape[y][x] === 1 && this.board[this.currentPiece.y + y][this.currentPiece.x + x].color !== "white" || this.currentPiece.x + x < 0 || this.currentPiece.x + x > 9) {
                    return;
                }
            }
        }

        this.currentPiece.shape = newShape;
    }

    checkCollision() {
        let shape = this.currentPiece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (this.currentPiece.y + y >= 22) {
                    return true;
                }
                if (shape[y][x] === 1 && this.board[this.currentPiece.y + y][this.currentPiece.x + x].color !== "white") {
                    return true;
                }
            }
        }
        return false;
    }

    addPieceToBoard() {
        let shape = this.currentPiece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 1) {
                    this.board[this.currentPiece.y + y][this.currentPiece.x + x].color = this.currentPiece.color;
                }
            }
        }
    }

    checkLines() {
        let lines = 0;
        for (let y = 0; y < this.board.length; y++) {
            let line = true;
            for (let x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x].color === "white") {
                    line = false;
                }
            }
            if (line) {
                lines++;
                this.board.splice(y, 1);
                this.board.unshift([]);
                for (let x = 0; x < 10; x++) {
                    this.board[0][x] = new Case(x, 0, "white");
                }
            }
        }
        return lines;
    }

    updateScore(lines) {
        this.lines += lines;
        switch (lines) {
            case 0:
                return;
            case 1:
                this.score += 30;
                break;
            case 2:
                this.score += 40;
                break;
            case 3:
                this.score += 50;
                break;
            case 4:
                this.score += 60;
                break;
        }

        console.log("score = ", this.score);

        if (this.score > 404) {
            this.gg();
        }
    }

    updateNextPiece() {
        let piece = this.createPiece();
        this.nextPiece = piece;
        this.pieces.push(piece);
    }

    updateCurrentPiece() {
        this.currentPiece = this.nextPiece;
        let shape = this.currentPiece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if(shape[y][x] === 1 && this.board[y][x].color !== "white") {
                    this.gameOver();
                }
            }
        }
        this.updateNextPiece();
    }

    update() {
        if (!this.movePieceDown()) {
            this.addPieceToBoard();
            let lines = this.checkLines();
            this.updateScore(lines);
            this.updateCurrentPiece();
        }
    }

    draw() {
        this.drawBoard();
        this.drawPiece(this.currentPiece);
    }

    loop() {
        this.update();
        this.draw();
    }

    start() {
        if (this.isStarted) {
            return;
        }
        this.isStarted = true;
        this.draw();
        this.intervalId = setInterval(this.loop.bind(this), 1000 - this.score);
        this.addHandlers();
    }

    gg() {
        clearInterval(this.intervalId);
        alert("Félicitation vous avez perdu votre temps !");
        this.init();
    }


    gameOver() {
        clearInterval(this.intervalId);
        alert("Game Over, retry ?");
        this.init();
    }

    addHandlers() {
        window.addEventListener("keydown", (e) => {
            if(this.checkCollision())
                return;

            switch (e.key) {
                case "ArrowLeft":
                    this.movePieceLeft();
                    break;
                case "ArrowRight":
                    this.movePieceRight();
                    break;
                case "ArrowUp":
                    this.rotatePiece();
                    break;
                case "ArrowDown":
                    this.movePieceDown();
                    break;
            }
            this.draw();
        });
    }
}

let tetris = new Game();

document.addEventListener('keydown', function (e) {
    if (e.key === " ") {
        tetris.start();
        //play musique tetris_cat_song.mp3
        /*let audio = new Audio('audio/tetris_cat_song.mp3');
        audio.play();
        audio.loop = true;*/
    }
});