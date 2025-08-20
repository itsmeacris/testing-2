const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let coinImg = new Image();
coinImg.src = "xioncoin.png";

// Sounds
let flapSound = new Audio("flap.mp3");
let pointSound = new Audio("point.mp3");
let hitSound = new Audio("hit.mp3");
let dieSound = new Audio("die.mp3");
let swooshSound = new Audio("swoosh.mp3");

// Game vars
let frames = 0;
let pipes = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let gameStarted = false;
let gameOver = false;

// Scaling for text/buttons
const scale = canvas.width / 400;

// Player
const player = {
  x: 50,
  y: 150,
  w: 30,
  h: 30,
  gravity: 0.25,
  lift: -4.6,
  velocity: 0,
  draw() {
    ctx.drawImage(coinImg, this.x, this.y, this.w, this.h);
  },
  update() {
    if (!gameStarted) return;
    this.velocity += this.gravity;
    this.y += this.velocity;

    if (this.y + this.h > canvas.height) {
      this.y = canvas.height - this.h;
      gameOver = true;
    }
    if (this.y < 0) this.y = 0;
  },
  flap() {
    this.velocity = this.lift;
    flapSound.play();
  }
};

// Pipes
function Pipe() {
  this.top = Math.random() * (canvas.height / 2);
  this.bottom = canvas.height - this.top - 120;
  this.x = canvas.width;
  this.w = 50;
  this.speed = 2;
  this.passed = false;

  this.draw = function () {
    ctx.fillStyle = "#228B22";
    // top pipe
    ctx.fillRect(this.x, 0, this.w, this.top);
    ctx.fillRect(this.x - 5, this.top - 20, this.w + 10, 20);
    // bottom pipe
    ctx.fillRect(this.x, canvas.height - this.bottom, this.w, this.bottom);
    ctx.fillRect(this.x - 5, canvas.height - this.bottom, this.w + 10, 20);
  };

  this.update = function () {
    this.x -= this.speed;
    if (this.x + this.w < 0) {
      pipes.shift();
    }
    // score
    if (!this.passed && this.x + this.w < player.x) {
      score++;
      pointSound.play();
      this.passed = true;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
      }
    }
    // collision
    if (
      player.x < this.x + this.w &&
      player.x + player.w > this.x &&
      (player.y < this.top || player.y + player.h > canvas.height - this.bottom)
    ) {
      hitSound.play();
      dieSound.play();
      gameOver = true;
    }
  };
}

// Reset
function resetGame() {
  player.y = 150;
  player.velocity = 0;
  pipes = [];
  score = 0;
  gameOver = false;
  gameStarted = true;
  swooshSound.play();
}

// Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background sky
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();
  for (let p of pipes) p.draw();

  // Score live
  if (gameStarted && !gameOver) {
    ctx.fillStyle = "#fff";
    ctx.font = `${32 * scale}px Arial`;
    ctx.fillText(score, canvas.width / 2 - 10, 50);
  }

  // Start screen
  if (!gameStarted && !gameOver) {
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 100);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 100);

    ctx.fillStyle = "#000";
    ctx.font = `${22 * scale}px Arial`;
    ctx.fillText("Start Game", canvas.width / 2 - 60, canvas.height / 2 - 15);

    ctx.font = `${16 * scale}px Arial`;
    ctx.fillText("Press SPACE or TAP", canvas.width / 2 - 80, canvas.height / 2 + 20);
  }

  // Game Over UI
  if (gameOver) {
    // Yellow Box
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(canvas.width / 2 - 120, canvas.height / 2 - 100, 240, 130);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(canvas.width / 2 - 120, canvas.height / 2 - 100, 240, 130);

    // Text inside box
    ctx.fillStyle = "#000";
    ctx.font = `${24 * scale}px Arial`;
    ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2 - 65);

    ctx.font = `${18 * scale}px Arial`;
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 - 35);
    ctx.fillText(`Best: ${bestScore}`, canvas.width / 2 - 50, canvas.height / 2 - 10);

    // Restart button
    ctx.fillStyle = "#f44336";
    ctx.fillRect(canvas.width / 2 - 70, canvas.height / 2 + 50, 140, 45);
    ctx.fillStyle = "#fff";
    ctx.font = `${20 * scale}px Arial`;
    ctx.fillText("Restart", canvas.width / 2 - 40, canvas.height / 2 + 78);
  }
}

// Update
function update() {
  if (gameStarted && !gameOver) {
    player.update();
    if (frames % 90 === 0) {
      pipes.push(new Pipe());
    }
    for (let p of pipes) p.update();
  }
  frames++;
  draw();
  requestAnimationFrame(update);
}

// Input
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameStarted) {
      gameStarted = true;
      swooshSound.play();
    }
    if (!gameOver) player.flap();
  }
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  if (!gameStarted) {
    gameStarted = true;
    swooshSound.play();
    player.flap();
  } else if (gameOver) {
    if (
      clickX >= canvas.width / 2 - 70 &&
      clickX <= canvas.width / 2 + 70 &&
      clickY >= canvas.height / 2 + 50 &&
      clickY <= canvas.height / 2 + 95
    ) {
      resetGame();
    }
  } else {
    player.flap();
  }
});

// Start loop
update();
