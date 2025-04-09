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

// Pre-load all character images with error handling
const characterImages = {};
let imagesLoaded = 0;
const totalImages = Object.keys(characterSprites).length;

function loadAllCharacters() {
  for (const character in characterSprites) {
    characterImages[character] = new Image();
    characterImages[character].onload = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        console.log("All character images loaded successfully");
      }
    };
    characterImages[character].onerror = () => {
      console.error(`Failed to load image: ${characterSprites[character]}`);
    };
    characterImages[character].src = characterSprites[character];
  }
}

loadAllCharacters();

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
const textSpeed = 7;

// Text animation properties
const textAnimations = {
  kate: { x: canvas.width, y: 0, opacity: 0, scale: 0.5, targetY: 0 },
  nguyen: { x: canvas.width, y: 0, opacity: 0, scale: 0.5, targetY: 0 },
  portfolio: { x: canvas.width, y: 0, opacity: 0, scale: 0.5, targetY: 0 }
};

function resetTextAnimation() {
  textAnimations.kate = { 
    x: canvas.width, 
    y: platforms[0].y + 80, 
    opacity: 0, 
    scale: 0.5,
    targetY: platforms[0].y + 80
  };
  
  textAnimations.nguyen = { 
    x: canvas.width, 
    y: platforms[1].y + 20, 
    opacity: 0, 
    scale: 0.5,
    targetY: platforms[1].y + 20
  };
  
  textAnimations.portfolio = { 
    x: canvas.width, 
    y: platforms[1].y + 100, 
    opacity: 0, 
    scale: 0.5,
    targetY: platforms[1].y + 100
  };
}

// Define portfolio projects
const portfolioProjects = [
  {
    id: 'project1',
    title: 'Web Development',
    description: 'Created responsive websites using HTML, CSS, and JavaScript',
    platformIndex: 5, // Which platform this project is attached to
    discovered: false
  },
  {
    id: 'project2',
    title: 'UI/UX Design',
    description: 'Designed user interfaces focusing on user experience and accessibility',
    platformIndex: 8,
    discovered: false
  },
  {
    id: 'project3',
    title: 'Mobile App Development',
    description: 'Built cross-platform mobile applications using React Native',
    platformIndex: 11,
    discovered: false
  },
  {
    id: 'project4',
    title: 'Game Design',
    description: 'Developed interactive games with engaging mechanics',
    platformIndex: 14,
    discovered: false
  }
];

// Game state controls
let gamePaused = true;
let gameStarted = false;

const overlay = document.getElementById("gameOverlay");
const startBtn = document.getElementById("startBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

// Add character selection UI
function addCharacterSelectionUI() {
  const leftBorder = document.querySelector('.left-border');
  leftBorder.innerHTML = `
    <div class="character-selection">
      <h2>Characters</h2>
      <div class="character-option" data-character="red">
        <img src="watermelon.png" alt="Watermelon">
        <span></span>
      </div>
      <div class="character-option" data-character="orange">
        <img src="orange.png" alt="Orange">
        <span></span>
      </div>
      <div class="character-option" data-character="blue">
        <img src="prettyblueberry.png" alt="Blueberry">
        <span></span>
      </div>
      <div class="character-option" data-character="brown">
        <img src="coconut.png" alt="Coconut">
        <span></span>
      </div>
    </div>
  `;

  // Add event listeners to character options
  document.querySelectorAll('.character-option').forEach(option => {
    option.addEventListener('click', () => {
      const character = option.getAttribute('data-character');
      changeCharacter(character);
      highlightSelectedCharacter(character);
    });
  });
  
  // Highlight the default character
  highlightSelectedCharacter(selectedCharacter);
}

// Highlight the selected character
function highlightSelectedCharacter(character) {
  document.querySelectorAll('.character-option').forEach(option => {
    if (option.getAttribute('data-character') === character) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

// Call the character selection UI function after the DOM is loaded
window.addEventListener('DOMContentLoaded', addCharacterSelectionUI);

startBtn.addEventListener("click", () => {
  overlay.style.display = "none";

  // Allow time for DOM/layout update
  setTimeout(() => {
    resizeCanvas();
    resetGame();
    gameStarted = true;
    gamePaused = false;
  }, 50);
});

resumeBtn.addEventListener("click", () => {
  gamePaused = false;
  overlay.style.display = "none";
});

restartBtn.addEventListener("click", () => {
  resetGame();
  gameStarted = false;
  gamePaused = true;
  startBtn.style.display = "inline-block";
  resumeBtn.style.display = "none";
  restartBtn.style.display = "none";
  overlay.style.display = "flex";
});

document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft") keys.left = true;
  if (event.code === "ArrowRight") keys.right = true;
  if (event.code === "ArrowDown" || event.code === "KeyS") keys.down = true;

  if ((event.code === "ArrowUp" || event.code === "Space" || event.code === "KeyW") && player.dy === 0) {
    player.dy = player.jumpPower;
  }

  if (event.code === "Digit1") changeCharacter('red');
  if (event.code === "Digit2") changeCharacter('orange');
  if (event.code === "Digit3") changeCharacter('blue');
  if (event.code === "Digit4") changeCharacter('brown');

  if (event.code === "KeyP" && gameStarted) {
    gamePaused = !gamePaused;
    if (gamePaused) {
      startBtn.style.display = "none";
      resumeBtn.style.display = "inline-block";
      restartBtn.style.display = "inline-block";
      overlay.style.display = "flex";
    } else {
      overlay.style.display = "none";
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft") keys.left = false;
  if (event.code === "ArrowRight") keys.right = false;
  if (event.code === "ArrowDown" || event.code === "KeyS") keys.down = false;
});

function updateTextAnimations() {
  // Animate Kate text
  if (textAnimations.kate.x > platforms[0].x + 20) {
    textAnimations.kate.x -= textSpeed;
  } else {
    textAnimations.kate.opacity = Math.min(textAnimations.kate.opacity + 0.05, 1);
    textAnimations.kate.scale = Math.min(textAnimations.kate.scale + 0.05, 1);
    
    // Create a floating effect
    textAnimations.kate.y = textAnimations.kate.targetY + Math.sin(Date.now() / 500) * 10;
  }
  
  // Start Nguyen animation after Kate is positioned
  if (textAnimations.kate.x <= platforms[0].x + 20) {
    if (textAnimations.nguyen.x > platforms[1].x + 20) {
      textAnimations.nguyen.x -= textSpeed;
    } else {
      textAnimations.nguyen.opacity = Math.min(textAnimations.nguyen.opacity + 0.05, 1);
      textAnimations.nguyen.scale = Math.min(textAnimations.nguyen.scale + 0.05, 1);
      textAnimations.nguyen.y = textAnimations.nguyen.targetY + Math.sin(Date.now() / 600) * 8;
    }
  }
  
  // Start Portfolio animation after Nguyen is positioned
  if (textAnimations.nguyen.x <= platforms[1].x + 20) {
    if (textAnimations.portfolio.x > platforms[1].x + 20) {
      textAnimations.portfolio.x -= textSpeed * 0.8;
    } else {
      textAnimations.portfolio.opacity = Math.min(textAnimations.portfolio.opacity + 0.03, 1);
      textAnimations.portfolio.scale = Math.min(textAnimations.portfolio.scale + 0.03, 1);
      textAnimations.portfolio.y = textAnimations.portfolio.targetY + Math.sin(Date.now() / 700) * 5;
    }
  }
}

function drawBackground() {
  let gradient = ctx.createLinearGradient(0, -cameraY, 0, totalLevelHeight - cameraY);
  gradient.addColorStop(0, "#ffdcac");
  gradient.addColorStop(0.5, "#ff7a7a");
  gradient.addColorStop(1, "#9e63c6");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, -cameraY, canvas.width, totalLevelHeight);
}

function drawAnimatedText() {
  // Draw Kate text
  ctx.save();
  ctx.globalAlpha = textAnimations.kate.opacity;
  ctx.translate(textAnimations.kate.x, textAnimations.kate.y);
  ctx.scale(textAnimations.kate.scale, textAnimations.kate.scale);
  ctx.fillStyle = "white";
  ctx.font = "125px 'SuperPixel'";
  ctx.fillText("Kate", 0, 0);
  ctx.restore();
  
  // Draw Nguyen text
  ctx.save();
  ctx.globalAlpha = textAnimations.nguyen.opacity;
  ctx.translate(textAnimations.nguyen.x, textAnimations.nguyen.y);
  ctx.scale(textAnimations.nguyen.scale, textAnimations.nguyen.scale);
  ctx.fillStyle = "white";
  ctx.font = "125px 'SuperPixel'";
  ctx.fillText("Nguyen", 0, 0);
  ctx.restore();
  
  // Draw Portfolio text with glow effect
  ctx.save();
  ctx.globalAlpha = textAnimations.portfolio.opacity;
  ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
  ctx.shadowBlur = 10 * textAnimations.portfolio.scale;
  ctx.translate(textAnimations.portfolio.x, textAnimations.portfolio.y);
  ctx.scale(textAnimations.portfolio.scale, textAnimations.portfolio.scale);
  ctx.fillStyle = "white";
  ctx.font = "45px 'SuperPixel', Arial";
  ctx.fillText("Portfolio Website", 0, 0);
  ctx.restore();
}

function drawProjectIndicators() {
  portfolioProjects.forEach(project => {
    if (!project.discovered) {
      const platform = platforms[project.platformIndex];
      if (platform) {
        // Draw an indicator above the platform
        ctx.save();
        ctx.fillStyle = project.discovered ? "rgba(100, 255, 100, 0.5)" : "rgba(255, 215, 0, 0.5)";
        ctx.beginPath();
        ctx.arc(platform.x + platform.width/2, platform.y - 30, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Add pulsing effect
        const pulseSize = 20 + Math.sin(Date.now() / 200) * 5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(platform.x + platform.width/2, platform.y - 30, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  });
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
    resetGame();
  }

  cameraY = Math.max(0, player.y - canvas.height / 2);
  
  updateTextAnimations();
  
  if (!gamePaused) {
    checkProjectDiscovery();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  ctx.save();
  ctx.translate(0, -cameraY);

  // Draw platforms
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  platforms.forEach((platform) => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });
  
  // Draw project indicators
  drawProjectIndicators();
  
  // Draw animated text
  drawAnimatedText();
  
  // Draw the player character
  if (characterImages[selectedCharacter]) {
    ctx.drawImage(characterImages[selectedCharacter], player.x, player.y, player.width, player.height);
  } else {
    // Draw a placeholder if image isn't loaded
    ctx.fillStyle = selectedCharacter;
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  ctx.restore();
}

function checkProjectDiscovery() {
  portfolioProjects.forEach(project => {
    if (!project.discovered) {
      const platform = platforms[project.platformIndex];
      if (platform && 
          player.x < platform.x + platform.width && 
          player.x + player.width > platform.x &&
          Math.abs(player.y + player.height - platform.y) < 5) {
        
        project.discovered = true;
        showProjectInfo(project);
      }
    }
  });
}

function showProjectInfo(project) {
  gamePaused = true;
  
  const projectOverlay = document.createElement('div');
  projectOverlay.className = 'project-overlay';
  projectOverlay.innerHTML = `
    <div class="project-card">
      <h2>${project.title}</h2>
      <p>${project.description}</p>
      <button class="continue-btn">Continue Adventure</button>
    </div>
  `;
  
  document.querySelector('.game-container').appendChild(projectOverlay);
  
  projectOverlay.querySelector('.continue-btn').addEventListener('click', () => {
    projectOverlay.remove();
    gamePaused = false;
  });
}

function gameLoop() {
  if (gameStarted && !gamePaused) {
    update();
    draw();
  } else if (!gameStarted) {
    draw(); // still show canvas behind overlay
  }
  requestAnimationFrame(gameLoop);
}

function changeCharacter(color) {
  if (characterSprites[color]) {
    selectedCharacter = color;
    highlightSelectedCharacter(color);
  }
}

function resetGame() {
  resizeCanvas(); // ensure canvas fits container on reset
  player.x = platforms[0].x + 10;
  player.y = platforms[0].y - player.height;
  player.dy = 0;
  cameraY = player.y - canvas.height / 2;
  resetTextAnimation();
  
  // Reset project discoveries
  portfolioProjects.forEach(project => {
    project.discovered = false;
  });
}

// Initialize the game
resetTextAnimation();
gameLoop();

// Add this to your script.js file
// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
  setupNavigation();
});

function setupNavigation() {
  const infoOverlay = document.getElementById('infoOverlay');
  const infoContent = document.querySelector('.info-content');
  const closeBtn = document.querySelector('.info-close');
  
  // Home button
  document.querySelector('.home-btn').addEventListener('click', function() {
    showInfoContent('home', 'Home');
  });
  
  // About button
  document.querySelector('.about-btn').addEventListener('click', function() {
    showInfoContent('about', 'About Me');
  });
  
  // Projects dropdown button
  const projectsDropdown = document.querySelector('.dropdown');
  projectsDropdown.addEventListener('click', function(e) {
    // Toggle active class to keep dropdown open
    if (e.target === this.querySelector('span') || e.target === this) {
      this.classList.toggle('active');
    }
  });
  
  // Project buttons
  document.querySelectorAll('.project-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      // Stop event propagation to prevent the dropdown from closing
      e.stopPropagation();
      
      const projectId = this.getAttribute('data-project');
      const projectTitle = this.textContent;
      showInfoContent(projectId, projectTitle);
      
      // Keep dropdown open after clicking a project
      projectsDropdown.classList.add('active');
    });
  });
  
  // Close button
  closeBtn.addEventListener('click', function() {
    infoOverlay.style.display = 'none';
  });
  
  // Close on clicking outside the content
  infoOverlay.addEventListener('click', function(e) {
    if (e.target === infoOverlay) {
      infoOverlay.style.display = 'none';
    }
  });
  
  // Close dropdown when clicking elsewhere
  document.addEventListener('click', function(e) {
    if (!projectsDropdown.contains(e.target)) {
      projectsDropdown.classList.remove('active');
    }
  });
}

function showInfoContent(contentType, title) {
  const infoOverlay = document.getElementById('infoOverlay');
  const infoContent = document.querySelector('.info-content');
  
  // Get content based on type
  let content = '';
  
  switch(contentType) {
    case 'home':
      content = `
        <h2>Welcome to My Portfolio</h2>
        <p>Hi there! I'm Kate Nguyen, and this is my interactive portfolio website.</p>
        <p>You can explore my projects by either playing the platformer game or using this navigation menu.</p>
        <p>Feel free to check out my projects and learn more about me using the navigation options.</p>
      `;
      break;
      
    case 'about':
      content = `
        <h2>About Me</h2>
        <p>Hello! I'm Kate Nguyen, a creative developer with a passion for interactive experiences and innovative web solutions.</p>
        <p>With expertise in web development, UI/UX design, mobile application development, and game design, I bring a diverse skill set to every project I work on.</p>
        <p>My journey in technology began with [your background information here], and I've since worked on numerous projects that showcase my ability to blend technical knowledge with creative thinking.</p>
        <p>I believe in creating digital experiences that are not only functional but also engaging and enjoyable for users.</p>
        <p><strong>Skills:</strong></p>
        <ul>
          <li>Front-end Development (HTML, CSS, JavaScript)</li>
          <li>UI/UX Design</li>
          <li>Mobile App Development</li>
          <li>Game Design and Development</li>
          <li>[Add your other relevant skills]</li>
        </ul>
        <p><strong>Education:</strong></p>
        <p>[Your education details here]</p>
        <p><strong>Contact:</strong></p>
        <p>Email: [your email]</p>
        <p>LinkedIn: [your LinkedIn profile]</p>
        <p>GitHub: [your GitHub profile]</p>
      `;
      break;
      
    case 'project1':
      content = getProjectContent('Web Development', 'Created responsive websites using HTML, CSS, and JavaScript', [
        'Developed a responsive e-commerce platform with shopping cart functionality',
        'Created a blog website with content management system',
        'Built a portfolio website using modern web technologies'
      ]);
      break;
      
    case 'project2':
      content = getProjectContent('UI/UX Design', 'Designed user interfaces focusing on user experience and accessibility', [
        'Redesigned an app interface leading to 40% increase in user engagement',
        'Created wireframes and prototypes for multiple web applications',
        'Conducted user testing and implemented improvements based on feedback'
      ]);
      break;
      
    case 'project3':
      content = getProjectContent('Mobile App Development', 'Built cross-platform mobile applications using React Native', [
        'Developed a fitness tracking app for iOS and Android',
        'Created a recipe management app with offline functionality',
        'Built a mobile game with over 10,000 downloads'
      ]);
      break;
      
    case 'project4':
      content = getProjectContent('Game Design', 'Developed interactive games with engaging mechanics', [
        'Created a platformer game with character customization',
        'Designed puzzle games with increasing difficulty levels',
        'Built an educational game for children to learn programming concepts'
      ]);
      break;
      
    default:
      content = '<h2>Content Not Found</h2><p>Sorry, the requested content is not available.</p>';
  }
  
  // Update and show the overlay
  infoContent.innerHTML = content;
  infoOverlay.style.display = 'flex';
}

function getProjectContent(title, description, bulletPoints) {
  let bulletHTML = '';
  bulletPoints.forEach(point => {
    bulletHTML += `<li>${point}</li>`;
  });
  
  return `
    <div class="project-content">
      <h2>${title}</h2>
      <div class="project-image">Project Image Placeholder</div>
      <p>${description}</p>
      <h3>Key Features:</h3>
      <ul>${bulletHTML}</ul>
      <p>Technologies used: [List relevant technologies]</p>
      <p>Timeline: [Project timeline]</p>
      <p>Role: [Your role in the project]</p>
      <p>[Additional project details can be added here]</p>
    </div>
  `;
}