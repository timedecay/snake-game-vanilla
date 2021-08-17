// 常量
const es = selector => document.querySelector(selector);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const overlay = es('#overlay');
const showPause = es('.pause-modal');
const showEnd = es('.end-modal');

const BACKGROUND_COLOR = 'White';
const BOARD_COLOR = 'Black';
const SNAKE_COLOR = 'CornflowerBlue';
const SNAKE_BOARD_COLOR = 'Black';

const SNAKE_SPEED = 150;
const SNAKE_LENGTH = 5;
const SNAKE_BODY_HEIGHT = 10;
const SNAKE_BODY_WIDTH = 10;

const FOOD_LENGTH = 10;
const FOOD_COLOR = 'LightCoral';
const FOOD_BOARD_COLOR = 'Black';

let dx = 10;
let dy = 0;

// 游戏初始化

let score = 0;
let changingDirection = false;
let isPause = false;

let food = {};
let snake = [
  { x: 150, y: 150 },
  { x: 140, y: 150 },
  { x: 130, y: 150 },
  { x: 120, y: 150 },
  { x: 110, y: 150 },
];

document.addEventListener('keydown', changeDirection);
document.addEventListener('keydown', gamePauseEvent);

function drawSnakePart(snakePart) {
  ctx.fillStyle = SNAKE_COLOR;
  ctx.strokeStyle = SNAKE_BOARD_COLOR;
  ctx.fillRect(snakePart.x, snakePart.y, SNAKE_BODY_HEIGHT, SNAKE_BODY_WIDTH);
  ctx.strokeRect(snakePart.x, snakePart.y, SNAKE_BODY_HEIGHT, SNAKE_BODY_WIDTH);
}

function drawSnake() {
  snake.forEach(drawSnakePart);
}

function clearCanvas() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.strokeStyle = BOARD_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// 食物生成
function getRandomTen(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function createFood() {
  food.x = getRandomTen(0, canvas.width - FOOD_LENGTH);
  food.y = getRandomTen(0, canvas.height - FOOD_LENGTH);

  snake.forEach(snakeHead => {
    if (snakeOverlap(snakeHead, food)) {
      createFood();
    }
  });
}

function drawFood() {
  ctx.fillStyle = FOOD_COLOR;
  ctx.strokeStyle = FOOD_BOARD_COLOR;
  ctx.fillRect(food.x, food.y, FOOD_LENGTH, FOOD_LENGTH);
  ctx.strokeRect(food.x, food.y, FOOD_LENGTH, FOOD_LENGTH);
}

// 得分
function scoreCounter() {
  const snakeEatFood = snakeOverlap(snake[0], food);

  if (snakeEatFood) {
    score += 10;
    document.getElementById('score').innerHTML = '得分：' + score;
    createFood();
  } else {
    snake.pop();
  }
}

// 移动
function advanceSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
  scoreCounter();
}

// 转向功能
function changeDirection(event) {
  if (changingDirection) {
    return;
  }

  const [goingUp, goingDown, goingLeft, goingRight] = [
    dy === -10,
    dy === 10,
    dx === -10,
    dx === 10,
  ];

  changingDirection = true;

  if (event.key === 'ArrowUp' && !goingDown) {
    dx = 0;
    dy = -10;
    return;
  } else if (event.key === 'ArrowDown' && !goingUp) {
    dx = 0;
    dy = 10;
    return;
  } else if (event.key === 'ArrowLeft' && !goingRight) {
    dx = -10;
    dy = 0;
    return;
  } else if (event.key === 'ArrowRight' && !goingLeft) {
    dx = 10;
    dy = 0;
    return;
  }
}

// 出界
function snakeOutOfMap() {
  const [topOut, bottomOut, leftOut, rightOut] = [
    snake[0].y < 0,
    snake[0].y > canvas.height - 10,
    snake[0].x < 0,
    snake[0].x > canvas.width - 10,
  ];
  recordScore();
  return topOut || bottomOut || leftOut || rightOut;
}

// 重叠判定
function snakeOverlap(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

// 身体相交
function snakeIntersect() {
  for (let i = 4; i < snake.length; i++) {
    const snakeHead = snake[0];
    return snakeOverlap(snake[i], snakeHead);
  }
}

// 结束判定
function gameOverCheck() {
  return snakeOutOfMap() || snakeIntersect();
}

// 结束弹窗 & 再来一局
function gameOverEvent() {
  const againBtn = es('#again-btn');
  showEnd.classList.toggle('modal-hide');
  overlay.classList.toggle('active');

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && gameOverCheck()) {
      window.location.reload();
    }
  });

  againBtn.addEventListener('click', function () {
    window.location.reload();
  });
}

// 记录
function recordScore() {
  let record = es('#highscore');
  let highScore = localStorage.highScore;

  if (localStorage.highScore === undefined) {
    localStorage.setItem('highScore', 0);
  } else if (score > highScore) {
    localStorage.setItem('highScore', score);
    record.innerHTML = '记录：' + score;
  } else {
    localStorage.setItem('highScore', highScore);
    record.innerHTML = '记录：' + highScore;
  }
}

// 暂停功能
function gamePauseEvent(event) {
  if (event.key === ' ' && !gameOverCheck()) {
    isPause = !isPause;
    showPause.classList.toggle('modal-hide');
    overlay.classList.toggle('active');
    main();
  }
}

// main 函数
function main() {
  if (isPause) {
    return;
  } else if (gameOverCheck()) {
    gameOverEvent();
    return;
  }

  setTimeout(() => {
    changingDirection = false;
    clearCanvas();
    drawFood();
    advanceSnake();
    drawSnake();
    main();
  }, SNAKE_SPEED);
}

createFood();
main();
