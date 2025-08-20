const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let gameRunning = false;
let gameOver = false;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

// Images
const coinImg = new Image();
coinImg.src = "xioncoin.png";

// Sounds
const flapSound = new Audio("flap.wav");
const pointSound = new Audio("point.wav");
const hitSound = new Audio("hit.wav");
const dieSound = new Audio("die.wav");
const swooshSound = new Audio("swoosh.wav");

// Unlock audio (required on browsers)
function unlockAudio() {
  [flapSound, pointSound, hitSound, dieSound, swooshSound].forEach(sound => {
    sound.muted = true;
    sound.play().catch(() => {});
    sound.muted = false;
  });
  document.removeEventListener("click", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
}
document.addEventListener("click", unlockAudio);
document.addEventListener("keydown", unlockAudio);

// Player
const player = {
  x: 50,
  y: 150,
  get w() { return canvas.width * 0.08; }, // coin scales with canvas
  get h() { return this.w; },
  gravity: 0.25,
  lift: -4.6,
  velocity: 0,
  draw() {
    ctx.drawImage(coinImg, this.x, this.y, this.w, this.h);
  },
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
    if (this.y + this.h > canvas.height) {
      this.y = canvas.height - this.h;
      this.velocity = 0;
      endGame();
    }
    if (this.y < 0) this.y = 0;
  },
  flap() {
    this.velocity = this.lift;
    flapSound.play();
  }
};

// Pipes
let pipes = [];
function createPipe() {
  let gap = 120;
  let topHeight = Math.random() * (canvas.height - gap - 100) + 50;
  pipes.push({
    x: canvas.width,
    y: topHeight,
    width: 60,
    gap: gap
  });
}
function updatePipes() {
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= 2;

    ctx.fillStyle = "#228B22";
    ctx.fillRect(p.x, 0, p.width, p.y);
    ctx.fillRect(p.x, p.y + p.gap, p.width, canvas.height - p.y - p.gap);

    // Collision
    if (
      player.x < p.x + p.width &&
      player.x + player.w > p.x &&
      (player.y < p.y || player.y + player.h > p.y + p.gap)
    ) {
      hitSound.play();
      endGame();
    }

    // Score
    if (p.x + p.width === player.x) {
      score++;
      pointSound.play();
    }
  }

  if (pipes.length && pipes[0].x + pipes[0].width < 0) {
    pipes.shift();
  }
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && gameRunning) {
    player.flap();
  } else if (e.code === "Space" && !gameRunning && !gameOver) {
    startGame();
  } else if (e.code === "Enter" && gameOver) {
    resetGame();
  }
});

canvas.addEventListener("click", () => {
  if (gameRunning) {
    player.flap();
  } else if (!gameRunning && !gameOver) {
    startGame();
  } else if (gameOver) {
    resetGame();
  }
});

// Game functions
function startGame() {
  swooshSound.play();
  gameRunning = true;
  gameOver = false;
  score = 0;
  pipes = [];
  player.y = 150;
  player.velocity = 0;
  createPipe();
}

function endGame() {
  gameOver = true;
  gameRunning = false;
  dieSound.play();
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }
}

function resetGame() {
  startGame();
}

function drawStartScreen() {
  ctx.fillStyle = "black";
  ctx.font = "28px Arial";
  ctx.fillText("Tap to Start", canvas.width / 2 - 80, canvas.height / 2);
  ctx.font = "18px Arial";
  ctx.fillText("Press SPACE or Tap to Flap", canvas.width / 2 - 115, canvas.height / 2 + 30);
}

function drawGameOver() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 60, 200, 120);
  ctx.strokeStyle = "black";
  ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 - 60, 200, 120);

  ctx.fillStyle = "black";
  ctx.font = "26px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2 - 80, canvas.height / 2 - 20);

  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, canvas.width / 2 - 50, canvas.height / 2 + 10);
  ctx.fillText("Best: " + bestScore, canvas.width / 2 - 50, canvas.height / 2 + 40);

  ctx.font = "16px Arial";
  ctx.fillText("Tap or Press Enter to Restart", canvas.width / 2 - 120, canvas.height / 2 + 70);
}

// Loop
function loop() {
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (gameRunning) {
    player.update();
    player.draw();
    updatePipes();

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
    ctx.fillText("Best: " + bestScore, 10, 50);

    if (Math.random() < 0.02) createPipe();
  } else if (gameOver) {
    drawGameOver();
  } else {
    drawStartScreen();
  }

  requestAnimationFrame(loop);
}

loop();
