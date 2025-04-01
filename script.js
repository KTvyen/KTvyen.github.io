const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size to fit the available game container
function resizeCanvas() {
  const gameContainer = document.querySelector('.game-container');
  canvas.width = gameContainer.clientWidth;
  canvas.height = gameContainer.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Character selection
const characterSprites = {
  red: 'redberry.png',
  blue: 'blueberry.png',
  orange: 'orangeberry.png',
  purple: 'purpleberry.png',
  yellow: 'yellowberry.png'
};

let selectedCharacter = 'red'; // Default character
const characterImage = new Image();
characterImage.src = characterSprites[selectedCharacter];

// Player properties
const player = {
  x: canvas.width / 2 - 35,
  y: 50,
  width: 150,
  height: 100,
  dx: 0,
  dy: 0,
  speed: 7,
  gravity: 0.5,
  jumpPower: -15,
  onPlatformIndex: -1
};

// Generate platforms in a zig-zag pattern
const platforms = [];
const platformSpacing = 200;
const totalPlatforms = 17;
const totalLevelHeight = totalPlatforms * platformSpacing;
let direction = 1;
let startX = 50;

for (let i = 0; i < totalPlatforms; i++) {
  platforms.push({ x: startX, y: i * platformSpacing + 100, width: 200, height: 20 });
  
  if (i % 2 === 1) {
    startX += direction * 250;
  }
  if (i % 4 === 3) {
    direction *= -1;
  }
}

// Controls
const keys = { left: false, right: false };

// Camera position
let cameraY = 0;

// Text animation properties
let kateX, nguyenX, portfolioX;
const textSpeed = 9;
function resetTextAnimation() {
  kateX = canvas.width;
  nguyenX = canvas.width;
  portfolioX = canvas.width;
}
resetTextAnimation();

// Key press event listeners
document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft") keys.left = true;
  if (event.code === "ArrowRight") keys.right = true;
  if ((event.code === "ArrowUp" || event.code === "Space") && player.dy === 0) {
    player.dy = player.jumpPower;
  }
  
  if (event.code === "Digit1") changeCharacter('red');
  if (event.code === "Digit2") changeCharacter('yellow');
  if (event.code === "Digit3") changeCharacter('orange');
  if (event.code === "Digit4") changeCharacter('purple');
  if (event.code === "Digit5") changeCharacter('blue');
});

document.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft") keys.left = false;
  if (event.code === "ArrowRight") keys.right = false;
});

function drawBackground() {
  let gradient = ctx.createLinearGradient(0, -cameraY, 0, totalLevelHeight - cameraY);
  gradient.addColorStop(0, "#ffdcac");
  gradient.addColorStop(0.5, "#ff7a7a");
  gradient.addColorStop(1, "#9e63c6");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, -cameraY, canvas.width, totalLevelHeight);
}

function update() {
  player.dx = keys.left ? -player.speed : keys.right ? player.speed : 0;
  player.dy += player.gravity;
  player.x += player.dx;
  player.y += player.dy;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  player.onPlatformIndex = -1;
  platforms.forEach((platform, i) => {
    if (player.dy > 0 &&
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height >= platform.y &&
      player.y + player.height - player.dy <= platform.y) {
      player.y = platform.y - player.height;
      player.dy = 0;
      player.onPlatformIndex = i;
    }
  });

  if (player.y > totalLevelHeight) {
    player.x = platforms[0].x + 10;
    player.y = platforms[0].y - player.height;
    player.dy = 0;
    cameraY = player.y - canvas.height / 2;
    resetTextAnimation();
  }

  cameraY = Math.max(0, player.y - canvas.height / 2);

  // Animate the text sliding in from the right
  if (kateX > platforms[0].x + 520) {
    kateX -= textSpeed;
} else if (nguyenX > platforms[1].x + 300) {
    nguyenX -= textSpeed;
} else if (portfolioX > platforms[1].x + 300) {
    portfolioX -= textSpeed;
}
if (nguyenX > platforms[1].x + 300) {
    nguyenX -= textSpeed;
}
if (portfolioX > platforms[1].x + 300) {
    portfolioX -= textSpeed;
}
  if (nguyenX > platforms[1].x + 300) {
    nguyenX -= textSpeed;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  ctx.save();
  ctx.translate(0, -cameraY);

  ctx.drawImage(characterImage, player.x, player.y, player.width, player.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  platforms.forEach((platform) => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });

  ctx.fillStyle = "white";
  ctx.font = "125px 'SuperPixel', Arial";
  ctx.fillText("Kate", kateX - 10, platforms[0].y + 80);
  ctx.fillText("Nguyen", nguyenX, platforms[1].y + 20);

  ctx.font = "45px 'SuperPixel', Arial";
  ctx.fillText("Portfolio Website", portfolioX + 10, platforms[1].y + 100);

  ctx.restore();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();

function changeCharacter(color) {
  if (characterSprites[color]) {
    selectedCharacter = color;
    characterImage.src = characterSprites[selectedCharacter];
  }
}
















