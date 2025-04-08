const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const gameContainer = document.querySelector('.game-container');
  canvas.width = gameContainer.clientWidth;
  canvas.height = gameContainer.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const characterSprites = {
  red: 'watermelon.png',
  blue: 'prettyblueberry.png',
  orange: 'orange.png',
  brown: 'coconut.png'
};

let selectedCharacter = 'red';
const characterImage = new Image();
characterImage.src = characterSprites[selectedCharacter];

const player = {
  x: canvas.width / 2 - 35,
  y: 50,
  width: 150,
  height: 150,
  dx: 0,
  dy: 0,
  speed: 7,
  gravity: 0.5,
  jumpPower: -15,
  onPlatformIndex: -1
};

let ignoredPlatformIndex = -1;

const platforms = [];
const platformSpacing = 200;
const totalPlatforms = 17;
const totalLevelHeight = totalPlatforms * platformSpacing;
let direction = 1;
let startX = 50;

for (let i = 0; i < totalPlatforms; i++) {
  platforms.push({ x: startX, y: i * platformSpacing + 100, width: 200, height: 20 });
  if (i % 2 === 1) startX += direction * 250;
  if (i % 4 === 3) direction *= -1;
}

const keys = { left: false, right: false, down: false };

let cameraY = 0;

let kateX, nguyenX, portfolioX;
const textSpeed = 7;
function resetTextAnimation() {
  kateX = canvas.width;
  nguyenX = canvas.width;
  portfolioX = canvas.width;
}
resetTextAnimation();

document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft") keys.left = true;
  if (event.code === "ArrowRight") keys.right = true;
  if (event.code === "ArrowDown" || event.code === "KeyS") keys.down = true;

  if ((event.code === "ArrowUp" || event.code === "Space" || event.code === "KeyW") && player.dy === 0) {
    player.dy = player.jumpPower;
  }

  if (event.code === "Digit1") changeCharacter('red');
  if (event.code === "Digit4") changeCharacter('brown');
  if (event.code === "Digit2") changeCharacter('orange');
  if (event.code === "Digit3") changeCharacter('blue');
});

document.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft") keys.left = false;
  if (event.code === "ArrowRight") keys.right = false;
  if (event.code === "ArrowDown" || event.code === "KeyS") keys.down = false;
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

  if (keys.down && player.onPlatformIndex !== -1) {
    ignoredPlatformIndex = player.onPlatformIndex;
    player.dy += 10;
  }

  player.onPlatformIndex = -1;
  platforms.forEach((platform, i) => {
    if (i === ignoredPlatformIndex) return;
    if (
      player.dy > 0 &&
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height >= platform.y &&
      player.y + player.height - player.dy <= platform.y
    ) {
      player.y = platform.y - player.height;
      player.dy = 0;
      player.onPlatformIndex = i;
      ignoredPlatformIndex = -1;
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

  if (kateX > platforms[0].x + 520) {
    kateX -= textSpeed;
  } else if (nguyenX > platforms[1].x + 300) {
    nguyenX -= textSpeed;
  } else if (portfolioX > platforms[1].x + 300) {
    portfolioX -= textSpeed;
  }

  if (nguyenX > platforms[1].x + 300) nguyenX -= textSpeed;
  if (portfolioX > platforms[1].x + 300) portfolioX -= textSpeed;
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
  ctx.font = "125px 'SuperPixel'";
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

gameLoop();

function changeCharacter(color) {
  if (characterSprites[color]) {
    selectedCharacter = color;
    characterImage.src = characterSprites[selectedCharacter];
  }
}
















