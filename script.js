(function () {
  const currentPage = document.body?.dataset.page || 'home';
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  const normalizePath = (href) => {
    try {
      const url = new URL(href, window.location.href);
      const file = url.pathname.split('/').pop() || 'index.html';
      return file.toLowerCase() === '' ? 'index.html' : file.toLowerCase();
    } catch {
      return href;
    }
  };

  navLinks.forEach((link) => {
    if (normalizePath(link.getAttribute('href') || '') === `${currentPage}.html`
      || (currentPage === 'home' && normalizePath(link.getAttribute('href') || '') === 'index.html')) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const shell = document.querySelector('[data-game-shell]');
  if (!shell) {
    return;
  }

  const stage = shell.querySelector('[data-game-stage]');
  const canvas = shell.querySelector('[data-canvas]');
  const overlay = shell.querySelector('[data-game-overlay]');
  const overlayTitle = shell.querySelector('[data-overlay-title]');
  const overlayCopy = shell.querySelector('[data-overlay-copy]');
  const fxLayer = shell.querySelector('[data-game-fx]');
  const ctx = canvas?.getContext('2d');
  if (!stage || !canvas || !ctx || !overlay || !overlayTitle || !overlayCopy || !fxLayer) {
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
  const SCORE_BY_CLEAR = [0, 1, 10, 100, 1000];
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
    I: ['0000', '1111', '0000', '0000'],
    O: ['0110', '0110', '0000', '0000'],
    T: ['0100', '1110', '0000', '0000'],
    L: ['0010', '1110', '0000', '0000'],
    J: ['1000', '1110', '0000', '0000'],
    S: ['0110', '1100', '0000', '0000'],
    Z: ['1100', '0110', '0000', '0000'],
  };

  const toMatrix = (rows) => rows.map((row) => row.split('').map((value) => Number(value)));
  const rotateMatrix = (matrix) => matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
  const baseMatrices = Object.fromEntries(Object.entries(SHAPES).map(([key, rows]) => [key, toMatrix(rows)]));

  const getMatrix = (type, rotation) => {
    let matrix = baseMatrices[type];
    for (let index = 0; index < rotation; index += 1) {
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
  let dropInterval = 360;
  let timer = null;
  let running = false;
  let paused = false;
  let gameOver = false;
  let boardPointer = null;
  let suppressClickUntil = 0;
  let flashTimer = null;

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

  const setOverlay = (visible, title, copy, shake = false) => {
    overlay.classList.toggle('is-visible', visible);
    if (title) {
      overlayTitle.textContent = title;
    }
    if (copy) {
      overlayCopy.textContent = copy;
    }
    overlay.classList.toggle('is-shaking', shake);
    if (shake) {
      window.setTimeout(() => {
        overlay.classList.remove('is-shaking');
      }, 520);
    }
  };

  const showReadyOverlay = () => {
    setOverlay(true, '게임 준비 완료', '보드를 클릭하거나 시작 버튼을 눌러 주세요.');
  };

  const showPauseOverlay = () => {
    setOverlay(true, '일시정지', '다시 시작 버튼 또는 보드 클릭으로 재개할 수 있습니다.');
  };

  const showGameOverOverlay = () => {
    setOverlay(true, '게임 오버', '보드를 클릭하거나 다시 시작 버튼을 눌러 주세요.', true);
  };

  const hideOverlay = () => {
    setOverlay(false, '게임 준비 완료', '보드를 클릭하거나 시작 버튼을 눌러 주세요.');
  };

  const randomType = () => TYPES[Math.floor(Math.random() * TYPES.length)];
  const spawnPiece = () => ({ type: randomType(), rotation: 0, x: 3, y: 0 });

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
    const clearedRows = [];
    for (let y = BOARD_HEIGHT - 1; y >= 0; y -= 1) {
      if (board[y].every(Boolean)) {
        board.splice(y, 1);
        board.unshift(Array(BOARD_WIDTH).fill(null));
        clearedRows.push(y);
        y += 1;
      }
    }
    return clearedRows;
  };

  const updateSpeed = () => {
    dropInterval = Math.max(90, 360 - (level - 1) * 32);
    if (running && timer) {
      window.clearInterval(timer);
      timer = window.setInterval(tick, dropInterval);
    }
  };

  const pulseInvert = () => {
    shell.classList.add('is-inverted');
    if (flashTimer) {
      window.clearTimeout(flashTimer);
    }
    flashTimer = window.setTimeout(() => {
      shell.classList.remove('is-inverted');
    }, 220);
  };

  const spawnBurst = (rows, color) => {
    const boardWidth = canvas.width;
    rows.forEach((row) => {
      const top = ((row + 0.5) / BOARD_HEIGHT) * 100;
      for (let i = 0; i < 10; i += 1) {
        const particle = document.createElement('span');
        const dx = (Math.random() * 2 - 1) * 170;
        const dy = (Math.random() * 2 - 1) * 120 - 30;
        particle.className = 'burst-particle';
        particle.style.setProperty('--top', `${top}%`);
        particle.style.setProperty('--size', `${6 + Math.random() * 8}px`);
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        particle.style.setProperty('--color', color);
        particle.style.left = `${(50 + (Math.random() * 2 - 1) * 18)}%`;
        fxLayer.appendChild(particle);
        window.setTimeout(() => particle.remove(), 700);
      }
    });
  };

  const lockPiece = () => {
    const lockedColor = COLORS[current.type];
    mergePiece();
    const clearedRows = clearLines();
    if (clearedRows.length > 0) {
      lines += clearedRows.length;
      score += SCORE_BY_CLEAR[clearedRows.length] || 0;
      level = 1 + Math.floor(lines / 10);
      updateSpeed();
      spawnBurst(clearedRows, lockedColor);
      pulseInvert();
      setStatus(clearedRows.length === 4 ? '테트리스!' : `${clearedRows.length}줄 제거`);
      if (score > bestScore) {
        bestScore = score;
        try {
          window.localStorage.setItem(STORAGE_KEY, String(bestScore));
        } catch {
          // ignore storage issues
        }
      }
    }

    current = spawnPiece();
    if (collides(current)) {
      gameOver = true;
      running = false;
      stopLoop();
      setStatus('게임 오버');
      showGameOverOverlay();
      return;
    }

    updateHud();
  };

  const resetGame = () => {
    board = createBoard();
    current = spawnPiece();
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 360;
    running = false;
    paused = false;
    gameOver = false;
    boardPointer = null;
    updateSpeed();
    updateHud();
    setStatus('대기');
    showReadyOverlay();
    draw();
  };

  const startLoop = () => {
    if (timer) {
      return;
    }
    timer = window.setInterval(tick, dropInterval);
  };

  const stopLoop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const move = (dx, dy) => {
    if (gameOver || paused) {
      return false;
    }
    if (!collides(current, dx, dy)) {
      current.x += dx;
      current.y += dy;
      return true;
    }
    return false;
  };

  const softDrop = () => {
    if (gameOver || paused) {
      return;
    }
    if (!move(0, 1)) {
      lockPiece();
    }
    draw();
  };

  const hardDrop = () => {
    if (gameOver || paused) {
      return;
    }
    while (move(0, 1)) {
      // keep dropping
    }
    lockPiece();
    draw();
  };

  const rotate = () => {
    if (gameOver || paused) {
      return;
    }
    const nextRotation = (current.rotation + 1) % 4;
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!collides(current, kick, 0, nextRotation)) {
        current.rotation = nextRotation;
        current.x += kick;
        draw();
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
      running = true;
      paused = false;
      hideOverlay();
      setStatus('진행 중');
      startLoop();
    } else if (paused) {
      paused = false;
      hideOverlay();
      setStatus('진행 중');
      startLoop();
    }
  };

  const pauseGame = () => {
    if (!running || gameOver) {
      return;
    }
    paused = !paused;
    if (paused) {
      stopLoop();
      setStatus('일시정지');
      showPauseOverlay();
    } else {
      setStatus('진행 중');
      hideOverlay();
      startLoop();
    }
    draw();
  };

  const restartGame = () => {
    stopLoop();
    resetGame();
    startGame();
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
    ctx.fillStyle = '#0f1a2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#13253d' : '#102337';
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
          drawCell(x, y, COLORS[current.type], 0.18);
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
  };

  const actionMap = {
    left: () => move(-1, 0),
    right: () => move(1, 0),
    down: () => softDrop(),
    rotate: () => rotate(),
    drop: () => hardDrop(),
  };

  const handleKeydown = (event) => {
    const code = event.code;
    const key = event.key.toLowerCase();
    const startable = ['arrowleft', 'arrowright', 'arrowdown', 'arrowup', 'a', 's', 'd', 'w', 'x', ' ', 'spacebar', 'enter'];

    if ((!running || gameOver) && startable.includes(key) || (!running || gameOver) && startable.includes(code.toLowerCase())) {
      if (code === 'Enter' || key === 'enter') {
        event.preventDefault();
        startGame();
        return;
      }
      if (code === 'Space' || key === ' ' || key === 'spacebar') {
        event.preventDefault();
        startGame();
        hardDrop();
        return;
      }
      startGame();
    }

    if (['arrowleft', 'a'].includes(key) || code === 'ArrowLeft' || code === 'KeyA') {
      event.preventDefault();
      actionMap.left();
    } else if (['arrowright', 'd'].includes(key) || code === 'ArrowRight' || code === 'KeyD') {
      event.preventDefault();
      actionMap.right();
    } else if (['arrowdown', 's'].includes(key) || code === 'ArrowDown' || code === 'KeyS') {
      event.preventDefault();
      actionMap.down();
    } else if (['arrowup', 'w', 'x'].includes(key) || code === 'ArrowUp' || code === 'KeyW' || code === 'KeyX') {
      event.preventDefault();
      actionMap.rotate();
    } else if (key === ' ' || key === 'spacebar' || code === 'Space') {
      event.preventDefault();
      actionMap.drop();
    } else if (key === 'p' || code === 'KeyP') {
      event.preventDefault();
      pauseGame();
    } else if (key === 'enter' || code === 'Enter') {
      event.preventDefault();
      startGame();
    }
  };

  const handleBoardPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    if (!running || gameOver) {
      event.preventDefault();
      startGame();
      return;
    }

    boardPointer = {
      x: event.clientX,
      y: event.clientY,
      time: window.performance.now(),
      pointerId: event.pointerId,
    };

    if (stage.setPointerCapture) {
      try {
        stage.setPointerCapture(event.pointerId);
      } catch {
        // ignore capture errors
      }
    }
  };

  const handleBoardPointerUp = (event) => {
    if (!boardPointer) {
      return;
    }

    const deltaX = event.clientX - boardPointer.x;
    const deltaY = event.clientY - boardPointer.y;
    const deltaTime = window.performance.now() - boardPointer.time;
    boardPointer = null;

    if (Math.abs(deltaX) < 16 && Math.abs(deltaY) < 16) {
      if (deltaTime < 450) {
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

  const pressControl = (action) => {
    if (!running || gameOver) {
      if (action === 'rotate' || action === 'left' || action === 'right' || action === 'down' || action === 'drop') {
        startGame();
      }
    }

    const handler = actionMap[action];
    if (handler) {
      handler();
      draw();
    }
  };

  const handleControlPointerDown = (event) => {
    event.preventDefault();
    suppressClickUntil = window.performance.now() + 260;
    pressControl(event.currentTarget.dataset.action);
  };

  const handleControlClick = (event) => {
    if (window.performance.now() < suppressClickUntil) {
      return;
    }
    pressControl(event.currentTarget.dataset.action);
  };

  startButton?.addEventListener('click', startGame);
  pauseButton?.addEventListener('click', pauseGame);
  restartButton?.addEventListener('click', restartGame);

  controls.forEach((button) => {
    button.addEventListener('pointerdown', handleControlPointerDown);
    button.addEventListener('click', handleControlClick);
  });

  document.addEventListener('keydown', handleKeydown);
  stage.addEventListener('pointerdown', handleBoardPointerDown);
  stage.addEventListener('pointerup', handleBoardPointerUp);
  stage.addEventListener('pointercancel', () => {
    boardPointer = null;
  });

  overlay.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    startGame();
  });

  resetGame();
  draw();
})();
