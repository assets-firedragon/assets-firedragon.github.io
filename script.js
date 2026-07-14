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
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) {
    return;
  }

  const scoreNode = shell.querySelector('[data-score]');
  const linesNode = shell.querySelector('[data-lines]');
  const bestScoreNode = shell.querySelector('[data-best-score]');
  const statusNode = shell.querySelector('[data-status]');
  const startButton = shell.querySelector('[data-start]');
  const pauseButton = shell.querySelector('[data-pause]');
  const restartButton = shell.querySelector('[data-restart]');
  const controls = Array.from(shell.querySelectorAll('[data-action]'));

  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  const CELL = 24;
  const STORAGE_KEY = 'assets-firedragon-tetris-best-score';
  const TYPES = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
  const COLORS = {
    I: '#67d7d1',
    O: '#f4c95d',
    T: '#c68bff',
    L: '#ff9f68',
    J: '#6ea8fe',
    S: '#7cd992',
    Z: '#ff7b7b',
  };

  const SHAPES = {
    I: [
      '0000',
      '1111',
      '0000',
      '0000',
    ],
    O: [
      '0110',
      '0110',
      '0000',
      '0000',
    ],
    T: [
      '0100',
      '1110',
      '0000',
      '0000',
    ],
    L: [
      '0010',
      '1110',
      '0000',
      '0000',
    ],
    J: [
      '1000',
      '1110',
      '0000',
      '0000',
    ],
    S: [
      '0110',
      '1100',
      '0000',
      '0000',
    ],
    Z: [
      '1100',
      '0110',
      '0000',
      '0000',
    ],
  };

  const toMatrix = (rows) => rows.map((row) => row.split('').map((value) => Number(value)));
  const rotateMatrix = (matrix) => matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
  const baseMatrices = Object.fromEntries(Object.entries(SHAPES).map(([key, rows]) => [key, toMatrix(rows)]));

  const getMatrix = (type, rotation) => {
    let matrix = baseMatrices[type];
    for (let i = 0; i < rotation; i += 1) {
      matrix = rotateMatrix(matrix);
    }
    return matrix;
  };

  const createBoard = () => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

  let board = createBoard();
  let current = null;
  let score = 0;
  let lines = 0;
  let level = 1;
  let bestScore = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
  let timer = null;
  let paused = false;
  let gameOver = false;
  let running = false;
  let touchStart = null;
  let dropInterval = 600;

  const setStatus = (value) => {
    if (statusNode) {
      statusNode.textContent = value;
    }
  };

  const updateHud = () => {
    if (scoreNode) scoreNode.textContent = String(score);
    if (linesNode) linesNode.textContent = String(lines);
    if (bestScoreNode) bestScoreNode.textContent = String(bestScore);
  };

  const randomType = () => TYPES[Math.floor(Math.random() * TYPES.length)];

  const spawnPiece = () => ({
    type: randomType(),
    rotation: 0,
    x: 3,
    y: 0,
  });

  const cellsFor = (piece, rotation = piece.rotation) => {
    const matrix = getMatrix(piece.type, rotation);
    const cells = [];
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          cells.push({ x, y });
        }
      });
    });
    return cells;
  };

  const collides = (piece, dx = 0, dy = 0, rotation = piece.rotation) => {
    return cellsFor(piece, rotation).some((cell) => {
      const x = piece.x + dx + cell.x;
      const y = piece.y + dy + cell.y;

      if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) {
        return true;
      }

      if (y < 0) {
        return false;
      }

      return Boolean(board[y][x]);
    });
  };

  const mergePiece = () => {
    cellsFor(current).forEach((cell) => {
      const x = current.x + cell.x;
      const y = current.y + cell.y;
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        board[y][x] = current.type;
      }
    });
  };

  const clearLines = () => {
    let cleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y -= 1) {
      if (board[y].every(Boolean)) {
        board.splice(y, 1);
        board.unshift(Array(BOARD_WIDTH).fill(null));
        cleared += 1;
        y += 1;
      }
    }
    return cleared;
  };

  const updateSpeed = () => {
    dropInterval = Math.max(120, 600 - (level - 1) * 45);
    if (running && timer) {
      window.clearInterval(timer);
      timer = window.setInterval(tick, dropInterval);
    }
  };

  const lockPiece = () => {
    mergePiece();
    const cleared = clearLines();
    if (cleared > 0) {
      lines += cleared;
      const lineScore = [0, 100, 300, 500, 800][cleared] || (cleared * 250);
      score += lineScore * level;
      level = 1 + Math.floor(lines / 10);
      updateSpeed();
      if (score > bestScore) {
        bestScore = score;
        window.localStorage.setItem(STORAGE_KEY, String(bestScore));
      }
      setStatus(cleared === 4 ? 'Tetris!' : 'Lines cleared');
    }

    current = spawnPiece();
    if (collides(current)) {
      gameOver = true;
      stopLoop();
      setStatus('Game Over');
    }
  };

  const resetGame = () => {
    board = createBoard();
    current = spawnPiece();
    score = 0;
    lines = 0;
    level = 1;
    paused = false;
    gameOver = false;
    running = false;
    touchStart = null;
    updateSpeed();
    if (collides(current)) {
      gameOver = true;
      setStatus('Game Over');
    } else {
      setStatus('Ready');
    }
    updateHud();
    draw();
  };

  const startLoop = () => {
    if (timer) {
      return;
    }
    timer = window.setInterval(tick, dropInterval);
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

  const move = (dx, dy) => {
    if (gameOver) return false;
    if (!collides(current, dx, dy)) {
      current.x += dx;
      current.y += dy;
      return true;
    }
    return false;
  };

  const softDrop = () => {
    if (!move(0, 1)) {
      lockPiece();
    } else {
      score += 1;
    }
    updateHud();
  };

  const hardDrop = () => {
    let dropped = 0;
    while (move(0, 1)) {
      dropped += 1;
    }
    score += dropped * 2;
    lockPiece();
    updateHud();
  };

  const rotate = () => {
    if (gameOver) return;
    const nextRotation = (current.rotation + 1) % 4;
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!collides(current, kick, 0, nextRotation)) {
        current.rotation = nextRotation;
        current.x += kick;
        return;
      }
    }
  };

  const tick = () => {
    if (!paused && !gameOver) {
      softDrop();
    }
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
    if (gameOver) {
      return;
    }
    paused = !paused;
    setStatus(paused ? 'Paused' : 'Playing');
    draw();
  };

  const restartGame = () => {
    stopLoop();
    resetGame();
    startLoop();
  };

  const drawCell = (x, y, color, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
    ctx.restore();
  };

  const ghostY = () => {
    let y = current.y;
    while (!collides(current, 0, y - current.y + 1)) {
      y += 1;
    }
    return y;
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f1722';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#12263b' : '#102033';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        if (board[y][x]) {
          drawCell(x, y, COLORS[board[y][x]]);
        }
      }
    }

    if (current) {
      const gY = ghostY();
      cellsFor(current).forEach((cell) => {
        const x = current.x + cell.x;
        const y = gY + cell.y;
        if (y >= 0) {
          drawCell(x, y, COLORS[current.type], 0.22);
        }
      });

      cellsFor(current).forEach((cell) => {
        const x = current.x + cell.x;
        const y = current.y + cell.y;
        if (y >= 0) {
          drawCell(x, y, COLORS[current.type], 1);
        }
      });
    }

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

  const handleKeydown = (event) => {
    const key = event.key.toLowerCase();

    if (['arrowleft', 'a'].includes(key)) {
      event.preventDefault();
      move(-1, 0);
    } else if (['arrowright', 'd'].includes(key)) {
      event.preventDefault();
      move(1, 0);
    } else if (['arrowdown', 's'].includes(key)) {
      event.preventDefault();
      softDrop();
    } else if (['arrowup', 'w', 'x'].includes(key)) {
      event.preventDefault();
      rotate();
    } else if (key === ' ' || key === 'spacebar') {
      event.preventDefault();
      hardDrop();
    } else if (key === 'p') {
      event.preventDefault();
      pauseGame();
    } else if (key === 'enter') {
      event.preventDefault();
      startGame();
    }
    draw();
  };

  const handleTouchStart = (event) => {
    const point = event.touches ? event.touches[0] : event;
    touchStart = {
      x: point.clientX,
      y: point.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (event) => {
    if (!touchStart) return;
    const point = event.changedTouches ? event.changedTouches[0] : event;
    const deltaX = point.clientX - touchStart.x;
    const deltaY = point.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    touchStart = null;

    if (Math.abs(deltaX) < 18 && Math.abs(deltaY) < 18) {
      if (deltaTime < 350) {
        rotate();
      }
      draw();
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        move(1, 0);
      } else {
        move(-1, 0);
      }
    } else if (deltaY > 0) {
      softDrop();
    } else {
      rotate();
    }
    draw();
  };

  startButton?.addEventListener('click', startGame);
  pauseButton?.addEventListener('click', pauseGame);
  restartButton?.addEventListener('click', restartGame);

  controls.forEach((button) => {
    button.addEventListener('click', () => {
      switch (button.dataset.action) {
        case 'left':
          move(-1, 0);
          break;
        case 'right':
          move(1, 0);
          break;
        case 'down':
          softDrop();
          break;
        case 'rotate':
          rotate();
          break;
        case 'drop':
          hardDrop();
          break;
        default:
          break;
      }
      draw();
    });
  });

  document.addEventListener('keydown', handleKeydown);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
  canvas.addEventListener('mousedown', handleTouchStart);
  canvas.addEventListener('mouseup', handleTouchEnd);

  resetGame();
  draw();
})();
