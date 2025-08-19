const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = canvas.width / 400; // used to scale text/buttons for all screens

let frames = 0;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let gameStarted = false;
let gameOver = false;

const gravity = 0.25;
const jump = 4.6;

// Sounds
const flapSound = new Audio("flap.wav");
const pointSound = new Audio("point.wav");
const hitSound = new Audio("hit.wav");
const dieSound = new Audio("die.wav");
const swooshSound = new Audio("swoosh.wav");

// Coin
const coinImg = new Image();
coinImg.src = "xioncoin.png";

// Bird
let bird = {
  x: 50,
  y: 150,
  radius: 12,
  velocity: 0,
  draw() {
    ctx.drawImage(coinImg, this.x - 12, this.y - 12, 24, 24);
  },
  update() {
    this.velocity += gravity;
    this.y += this.velocity;
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      gameOver = true;
    }
  },
  flap() {
    this.velocity = -jump;
    flapSound.play();
  },
};

// Pipes
let pipes = [];
function spawnPipe() {
  let gap = 90;
  let topHeight = Math.floor(Math.random() * (canvas.height / 2));
  pipes.push({
    x: canvas.width,
    y: topHeight,
    width: 52,
    gap: gap,
  });
}

function drawPipes() {
  ctx.fillStyle = "#228B22";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
    ctx.fillRect(pipe.x - 2, pipe.y - 20, pipe.width + 4, 20);
    ctx.fillRect(pipe.x, pipe.y + pipe.gap, pipe.width, canvas.height);
    ctx.fillRect(pipe.x - 2, pipe.y + pipe.gap, pipe.width + 4, 20);
  });
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= 2;

    if (
      bird.x + bird.radius > pipe.x &&
      bird.x - bird.radius < pipe.x + pipe.width &&
      (bird.y - bird.radius < pipe.y ||
        bird.y + bird.radius > pipe.y + pipe.gap)
    ) {
      hitSound.play();
      dieSound.play();
      gameOver = true;
    }

    if (pipe.x + pipe.width === bird.x) {
      score++;
      pointSound.play();
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
      }
    }
  });

  if (pipes.length && pipes[0].x < -pipes[0].width) {
    pipes.shift();
  }

  if (frames % 100 === 0) {
    spawnPipe();
  }
}

// Draw
function draw() {
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  bird.draw();
  drawPipes();

  // Live score + best score while playing
  ctx.fillStyle = "#000";
  ctx.font = "18px Arial";
  ctx.fillText(`Score: ${score}`, 10, 25);
  ctx.fillText(`Best: ${bestScore}`, 10, 50);

  // Start Screen
  if (!gameStarted && !gameOver) {
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(canvas.width / 2 - 70, canvas.height / 2 - 30, 140, 40);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(canvas.width / 2 - 70, canvas.height / 2 - 30, 140, 40);
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Start", canvas.width / 2 - 25, canvas.height / 2 - 5);
  }

  // Game Over screen
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

  // Restart button BELOW the box
  ctx.fillStyle = "#f44336";
  ctx.fillRect(canvas.width / 2 - 70, canvas.height / 2 + 50, 140, 45);
  ctx.fillStyle = "#fff";
  ctx.font = `${20 * scale}px Arial`;
  ctx.fillText("Restart", canvas.width / 2 - 40, canvas.height / 2 + 78);
}

// Update
function update() {
  if (!gameOver && gameStarted) {
    bird.update();
    updatePipes();
  }
}

function loop() {
  update();
  draw();
  frames++;
  requestAnimationFrame(loop);
}

// Controls
canvas.addEventListener("click", function (e) {
  let rect = canvas.getBoundingClientRect();
  let clickX = e.clientX - rect.left;
  let clickY = e.clientY - rect.top;

  if (!gameStarted && !gameOver) {
    // Start button
    if (
      clickX >= canvas.width / 2 - 70 &&
      clickX <= canvas.width / 2 + 70 &&
      clickY >= canvas.height / 2 - 30 &&
      clickY <= canvas.height / 2 + 10
    ) {
      gameStarted = true;
      swooshSound.play();
      bird.flap();
      return;
    }
  }

  if (gameOver) {
    // Restart button
    if (
      clickX >= canvas.width / 2 - 50 &&
      clickX <= canvas.width / 2 + 50 &&
      clickY >= canvas.height / 2 + 40 &&
      clickY <= canvas.height / 2 + 75
    ) {
      resetGame();
    }
  } else {
    bird.flap();
  }
});

function resetGame() {
  score = 0;
  bird.y = 150;
  bird.velocity = 0;
  pipes = [];
  gameOver = false;
  gameStarted = false;
}

loop();
const scale = canvas.width / 400; // used to scale text/buttons for all screens



