(function () {
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  if (navLinks.length) {
    const setActiveLink = () => {
      const currentHash = window.location.hash || '#home';

      navLinks.forEach((link) => {
        if (link.getAttribute('href') === currentHash) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    window.addEventListener('hashchange', setActiveLink);
    setActiveLink();
  }

  const shell = document.querySelector('[data-game-shell]');
  if (!shell) {
    return;
  }

  const canvas = shell.querySelector('[data-canvas]');
  const ctx = canvas.getContext('2d');
  const scoreNode = shell.querySelector('[data-score]');
  const bestScoreNode = shell.querySelector('[data-best-score]');
  const statusNode = shell.querySelector('[data-status]');
  const startButton = shell.querySelector('[data-start]');
  const pauseButton = shell.querySelector('[data-pause]');
  const restartButton = shell.querySelector('[data-restart]');
  const controls = Array.from(shell.querySelectorAll('[data-dir]'));

  const gridSize = 18;
  const tileCount = canvas.width / gridSize;
  const storageKey = 'assets-firedragon-snake-best-score';

  let snake = [];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let food = { x: 0, y: 0 };
  let score = 0;
  let bestScore = Number(window.localStorage.getItem(storageKey) || 0);
  let timer = null;
  let running = false;
  let paused = false;
  let gameOver = false;
  let swipeStart = null;

  const updateHud = (statusText = null) => {
    if (scoreNode) {
      scoreNode.textContent = String(score);
    }
    if (bestScoreNode) {
      bestScoreNode.textContent = String(bestScore);
    }
    if (statusNode && statusText) {
      statusNode.textContent = statusText;
    }
  };

  const setStatus = (text) => {
    if (statusNode) {
      statusNode.textContent = text;
    }
  };

  const randomCell = () => ({
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
  });

  const placeFood = () => {
    let next = randomCell();
    while (snake.some((segment) => segment.x === next.x && segment.y === next.y)) {
      next = randomCell();
    }
    food = next;
  };

  const resetGame = () => {
    snake = [
      { x: 8, y: 9 },
      { x: 7, y: 9 },
      { x: 6, y: 9 },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    paused = false;
    gameOver = false;
    placeFood();
    updateHud('Ready');
    draw();
  };

  const startLoop = () => {
    if (timer) {
      return;
    }
    timer = window.setInterval(tick, 120);
    running = true;
    setStatus(paused ? 'Paused' : 'Playing');
  };

  const stopLoop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    running = false;
  };

  const endGame = () => {
    gameOver = true;
    paused = false;
    stopLoop();
    setStatus('Game Over');
  };

  const drawCell = (x, y, fillStyle, glow = false) => {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(x * gridSize + 1, y * gridSize + 1, gridSize - 2, gridSize - 2);
    if (glow) {
      ctx.shadowColor = fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillRect(x * gridSize + 3, y * gridSize + 3, gridSize - 6, gridSize - 6);
      ctx.shadowBlur = 0;
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#102030';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < tileCount; i += 1) {
      for (let j = 0; j < tileCount; j += 1) {
        ctx.fillStyle = (i + j) % 2 === 0 ? '#12263b' : '#102033';
        ctx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
      }
    }

    drawCell(food.x, food.y, '#f4c95d', true);

    snake.forEach((segment, index) => {
      drawCell(segment.x, segment.y, index === 0 ? '#7ce6bf' : '#46b99a', index === 0);
    });

    if (gameOver) {
      ctx.fillStyle = 'rgba(8, 14, 22, 0.72)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = '700 24px system-ui, sans-serif';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 8);
      ctx.font = '500 15px system-ui, sans-serif';
      ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 18);
    }
  };

  const commitDirection = () => {
    const opposite = nextDirection.x + direction.x === 0 && nextDirection.y + direction.y === 0;
    if (!opposite) {
      direction = nextDirection;
    }
  };

  const tick = () => {
    if (paused || gameOver) {
      draw();
      return;
    }

    commitDirection();

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
      endGame();
      draw();
      return;
    }

    if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      endGame();
      draw();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 1;
      if (score > bestScore) {
        bestScore = score;
        window.localStorage.setItem(storageKey, String(bestScore));
      }
      setStatus('Playing');
      placeFood();
    } else {
      snake.pop();
    }

    updateHud();
    draw();
  };

  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    if (!running) {
      startLoop();
    }
    paused = false;
    setStatus('Playing');
  };

  const pauseGame = () => {
    if (!running && !paused) {
      startLoop();
    }
    if (!gameOver) {
      paused = !paused;
      setStatus(paused ? 'Paused' : 'Playing');
      draw();
    }
  };

  const restartGame = () => {
    stopLoop();
    resetGame();
    startLoop();
  };

  const setDirection = (dir) => {
    const map = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const next = map[dir];
    if (!next) {
      return;
    }
    const opposite = next.x + direction.x === 0 && next.y + direction.y === 0;
    if (!opposite) {
      nextDirection = next;
      if (!running && !gameOver) {
        startLoop();
      }
    }
  };

  const handleKeydown = (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'w'].includes(key)) {
      event.preventDefault();
      setDirection('up');
    } else if (['arrowdown', 's'].includes(key)) {
      event.preventDefault();
      setDirection('down');
    } else if (['arrowleft', 'a'].includes(key)) {
      event.preventDefault();
      setDirection('left');
    } else if (['arrowright', 'd'].includes(key)) {
      event.preventDefault();
      setDirection('right');
    } else if (key === ' ' || key === 'spacebar') {
      event.preventDefault();
      pauseGame();
    } else if (key === 'enter') {
      event.preventDefault();
      startGame();
    }
  };

  const handleSwipeStart = (event) => {
    const point = event.touches ? event.touches[0] : event;
    swipeStart = { x: point.clientX, y: point.clientY };
  };

  const handleSwipeEnd = (event) => {
    if (!swipeStart) {
      return;
    }
    const point = event.changedTouches ? event.changedTouches[0] : event;
    const deltaX = point.clientX - swipeStart.x;
    const deltaY = point.clientY - swipeStart.y;
    swipeStart = null;

    if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setDirection(deltaY > 0 ? 'down' : 'up');
    }
  };

  startButton?.addEventListener('click', startGame);
  pauseButton?.addEventListener('click', pauseGame);
  restartButton?.addEventListener('click', restartGame);

  controls.forEach((button) => {
    button.addEventListener('click', () => setDirection(button.dataset.dir));
  });

  document.addEventListener('keydown', handleKeydown);
  canvas.addEventListener('touchstart', handleSwipeStart, { passive: true });
  canvas.addEventListener('touchend', handleSwipeEnd, { passive: true });
  canvas.addEventListener('mousedown', handleSwipeStart);
  canvas.addEventListener('mouseup', handleSwipeEnd);

  resetGame();
  draw();
})();
