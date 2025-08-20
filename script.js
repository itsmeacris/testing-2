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

    // Draw pipe (flappy style)
    ctx.fillStyle = "#228B22";
    ctx.fillRect(p.x, 0, p.width, p.y);
    ctx.fillRect(p.x, p.y + p.gap, p.width, canvas.height - p.y - p.gap);

    // Check collision
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

  // Remove off-screen pipes
  if (pi
