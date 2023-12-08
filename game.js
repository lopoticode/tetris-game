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
    t: [[1, 1, 1],
        [0, 1, 0]]
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
        this.rotation = 0;
        this.typeShape = Object.keys(shapes).find(key => shapes[key] === shape);
    }
}

class Game {
    constructor() {
        this.init();
        this.audio = new Audio('audio/tetris_cat_song.mp3');
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

        let colors = ["#B56576", "#DDF2EB", "#96E072", "#EEE5E9", "#5BC0EB"];
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
                ctx.fillStyle = "white";//this.board[y][x].color;
                ctx.fillRect(x * 30 + 1, y * 30 + 1, 28, 28);
            }
        }

        this.pieces.forEach(piece => {
            if(piece !== this.nextPiece)
                this.drawPieceImg(piece);
        });

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

    drawPieceImg(piece) {
        let ctx = canvas.getContext("2d");
        let img = new Image();
        img.src = "images/" + piece.typeShape + ".svg";

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] === 1 && this.board[piece.y + y][piece.x + x].color !== "white") {
                    ctx.drawImage(img, (piece.x + x) * 30 + 1, (piece.y + y) * 30 + 1, 28, 28);
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
        this.pieces[this.pieces.length - 2].rotation = (this.currentPiece.rotation + 90) % 360;

        let shape = this.currentPiece.shape;
        let newShape = [];
        for (let x = 0; x < shape[0].length; x++) {
            newShape[x] = [];
            for (let y = shape.length - 1; y >= 0; y--) {
                newShape[x][shape.length - 1 - y] = shape[y][x];
            }
        }

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
                this.score += 65;
                break;
            case 3:
                this.score += 100;
                break;
            case 4:
                this.score += 135;
                break;
        }

        let score = document.getElementById("score-player");
        score.innerText = this.score;

        if (this.score > 404) {
            this.gg();
        }
    }

    updateNextPiece() {
        let piece = this.createPiece();
        let nextPiece = document.getElementById("next-piece");
        nextPiece.src = "images_next/" + piece.typeShape + ".svg";

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
        this.drawPieceImg(this.currentPiece);
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
        this.playMusic();
    }

    gg() {
        clearInterval(this.intervalId);
        let end = document.getElementById("end-dialog");
        end.innerText = "Félicitation !\nVous avez perdu votre temps !";

        let leftPart = document.getElementById("left-part");
        leftPart.appendChild(createShareButton());
        this.init();
    }


    gameOver() {
        this.stopMusic();
        clearInterval(this.intervalId);
        let end = document.getElementById("end-dialog");
        end.innerText = "Game Over, retry ?";
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

    playMusic() {
        this.audio.play();
        this.audio.loop = true;
        this.audio.volume = 1;
    }

    stopMusic(){
        this.audio.pause();
    }
}

function createShareButton() {
    const btn = document.createElement("button");

    btn.innerText = "share" in navigator ? "Share" : "Share via e-mail";

    const title = document.title;
    const text = "Check this out!";
    const url = window.location.href
    btn.onclick = () => {
        if (navigator.share !== undefined) {
            navigator.share({
                title,
                text
            })
                .then(() => console.log("Shared!"))
                .catch(err => console.error(err));
        } else {
            window.location = `mailto:?subject=${title}&body=${text}%0A${url}`;
        }
    };
    return btn;
}

let tetris = new Game();

document.addEventListener('keydown', function (e) {
    if (e.key === " ") {
        tetris.start();
    }
});