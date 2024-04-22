import MazeGen from './RandomKruskal.js';
import MazeView from './v_topdown.js';

const LOGGER = 'GAME';

const docrunner = {
  Width: '6',
  Height: '10',
  Seed: (() => {
    let timestamp = new Date();
    timestamp.setMinutes(0);
    return timestamp
            .toISOString()
            .substring(0, 16).replace('T', ' ') + 'z';
  })()
};
(() => {
  const q = new URLSearchParams(location.search);
  if (q.has('seed'))
    docrunner.Seed = q.get('seed');
  if (q.has('width'))
    docrunner.Width = q.get('width');
  if (q.has('height'))
    docrunner.Height = q.get('height');
  console.log(LOGGER, docrunner);
})();

document.getElementById('seed').textContent = docrunner.Seed;
const maze = new MazeGen(Number(docrunner.Width), Number(docrunner.Height), docrunner.Seed);
const view = new MazeView(maze);

const gamestate = {
  startCell: maze.exit,
  targetCell: maze.entrance,
  currentCell: null,
  moving: true,
  direction: 'NORTH',
  playerDir: null,
  getViewX: (cell) => gamestate.oX + gamestate.w * cell.col,
  getViewY: (cell) => gamestate.oY + gamestate.h * cell.row
};
gamestate.currentCell = gamestate.startCell;

//console.debug(LOGGER, gamestate.startCell, gamestate.targetCell);
function initializeGame() {
  let wrapper = document.createElement('div');
  wrapper.className = 'mazeview';
  let shadow = wrapper.attachShadow({
    mode: 'open'
  });
  var img = view.create();
  shadow.append(img);
  if (img.hasAttribute('width'))
    wrapper.dataset.width = Number(img.getAttribute('width')) + 'px';
  if (img.hasAttribute('height'))
    wrapper.dataset.height = Number(img.getAttribute('height')) + 'px';

  gamestate.w = Number(view.cellWidth);
  gamestate.h = Number(view.cellHeight);
  gamestate.oX = Number(view.offsetX);
  gamestate.oY = Number(view.offsetY);

  const startX = gamestate.getViewX(gamestate.startCell);
  const startY = gamestate.getViewY(gamestate.startCell);
  img.setAttribute('width', gamestate.w * 4);
  img.setAttribute('height', gamestate.h * 4);
  img.setAttribute('viewBox',
          startX + ' ' + startY + ' ' + gamestate.w + ' ' + gamestate.h);
  img.setAttribute('part', 'mazeview');

  gamestate.playerOffsetX = 0;
  gamestate.playerOffsetY = 0;
  gamestate.direction = 'NORTH';
  gamestate.moving = true;
  gamestate.img = img;

  if (view.hasPlayer) {
    //console.debug(LOGGER, view.player);
    let dir = view.player.directions[gamestate.direction];
    gamestate.playerOffsetX = "playerOffsetX" in view
            ? view.playerOffsetX : (gamestate.w / 2);
    gamestate.playerOffsetY = "playerOffsetY" in view
            ? view.playerOffsetY : (gamestate.h / 2);
    let player = document.createElementNS(img.namespaceURI, 'use');
    player.setAttribute('id', 'playerCharacter');
    player.setAttribute('href', '#' + dir.still);
    player.setAttribute('x', startX + gamestate.playerOffsetX + dir.offsetX);
    player.setAttribute('y', startY + gamestate.h + gamestate.playerOffsetY + dir.offsetY);
    img.append(player);
    let targetY = startY + gamestate.playerOffsetY + dir.offsetY;
    movePlayerOnly(player, targetY, true);
  }
  (() => {
    let rsg = ['Ready.', 'Steady.', 'GO!'];
    const tick = (24 * 75) / rsg.length;
    const ui = document.getElementById('timer');
    function ticker() {
      let token = rsg.shift();
      ui.textContent = ui.textContent + ' ' + token;
      if (rsg.length > 0)
        setTimeout(ticker, tick);
      else {
        console.log(LOGGER, 'GO!');
        gamestate.moving = false;
      }
    }

    setTimeout(ticker, tick);
  })();

  document.querySelector('main .game').append(wrapper);
  try {
    document.querySelector('main').append(new DebugView(maze).create());
  } catch (e) {
    console.debug(LOGGER, "debug mode disabled");
  }

}

function movePlayerOnly(player, targetY, moveAfter) {
  let playerY = Number(player.getAttribute('y'));
  gamestate.moving = true;
  const deltaY = (targetY - playerY) / 24;
  function movePlayerToStart() {
    playerY = playerY + deltaY;
    if (Math.abs(playerY - targetY) < 0.1) {
      gamestate.direction = 'SOUTH';
      let dir = view.player.directions[gamestate.direction];
      console.debug('GAME', gamestate.direction, dir);
      player.setAttribute('href', '#' + dir.still);
      player.setAttribute('y', targetY);
      gamestate.moving = !moveAfter;
    } else {
      player.setAttribute('y', playerY);
      setTimeout(movePlayerToStart, 75);
    }
  }
  setTimeout(movePlayerToStart, 0);
}

let timer = null;
let startTime = null;
function startTimer() {
  if (timer)
    return;
  startTime = Date.now();
  timer = setTimeout(updateTimer, 0);
}

function updateTimer() {
  let currentTime = Date.now();
  let delta = currentTime - startTime;
  const ui = document.getElementById('timer');
  let sec = Math.floor(delta / 1000);
  ui.textContent = 'Time: ' + (sec >= 60 ? Math.floor(sec / 60) + 'm ' : '') + (sec % 60) + 's';
  if (timer) {
    timer = setTimeout(updateTimer, 150);
  } else {
    let a = document.createElement('a');
    let next = {seed:docrunner.Seed};
    const q = new URLSearchParams(location.search);
    if (q.has('width'))
      next.width = docrunner.Width;
    if (q.has('height'))
      next.height = docrunner.Height;
    a.href = './view.html?' + new URLSearchParams(next);
    a.textContent = ui.textContent + " / done";
    ui.replaceChildren(a);
  }
}
function stopTimer() {
  timer = null;
}

document.addEventListener('keydown', (evt) => {
  if (evt.isComposing || evt.keyCode === 229) {
    //from mdn docs
    return;
  }
  if (gamestate.moving) {
    switch (evt.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'ArrowRight':
        evt.preventDefault();
        return;
    }
  }
  let nextCell = null;
  let currentCell = gamestate.currentCell;
  switch (evt.key) {
    case 'ArrowUp':
      //if(currentCell.wall)
      if ((currentCell.walls & MazeGen.NORTH) === 0) {
        gamestate.direction = 'NORTH';
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.NORTH);
      }
      break;
    case 'ArrowLeft':
      if ((currentCell.walls & MazeGen.WEST) === 0) {
        gamestate.direction = 'WEST';
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.WEST);
      }
      break;
    case 'ArrowDown':
      if ((currentCell.walls & MazeGen.SOUTH) === 0) {
        gamestate.direction = 'SOUTH';
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.SOUTH);
      }
      break;
    case 'ArrowRight':
      if ((currentCell.walls & MazeGen.EAST) === 0) {
        gamestate.direction = 'EAST';
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.EAST);
      }
      break;
    default:
      return;
  }
  evt.preventDefault();
  moveToNext(nextCell);
});

// initTouch
(() => {
  const el = document.querySelector('main .game');
  el.addEventListener("touchstart", handleTouchStart);
  el.addEventListener("touchend", handleTouchEnd);
  el.addEventListener("touchcancel", handleTouchEnd);
  el.addEventListener("touchmove", handleTouchMove);

  let startPoint;
  function handleTouchMove(evt) {
    evt.preventDefault();
  }
  function handleTouchEnd(evt) {
    evt.preventDefault();
    if (startPoint && evt.changedTouches.length === 1) {
      //console.log(LOGGER, "END", startPoint, evt.changedTouches[0]);
      let deltaX = evt.changedTouches[0].pageX - startPoint.pageX;
      let deltaY = evt.changedTouches[0].pageY - startPoint.pageY;
      //console.log(LOGGER, 'DELTA', deltaX, deltaY);
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        return;
      }
      let nextCell = null;
      let currentCell = gamestate.currentCell;
      if (Math.abs(deltaX) < Math.abs(deltaY)) {
        if (deltaY > 0) {
          if ((currentCell.walls & MazeGen.NORTH) === 0) {
            gamestate.direction = 'NORTH';
            nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.NORTH);
          }
        } else {
          if ((currentCell.walls & MazeGen.SOUTH) === 0) {
            gamestate.direction = 'SOUTH';
            nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.SOUTH);
          }
        }
      } else {
        if (deltaX > 0) {
          if ((currentCell.walls & MazeGen.WEST) === 0) {
            gamestate.direction = 'WEST';
            nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.WEST);
          }
        } else {
          if ((currentCell.walls & MazeGen.EAST) === 0) {
            gamestate.direction = 'EAST';
            nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.EAST);
          }
        }
      }
      moveToNext(nextCell);
    }
    startPoint = null;
  }
  function handleTouchStart(evt) {
    //console.log(LOGGER, "START");
    evt.preventDefault();
    if (!gamestate.moving && evt.touches.length === 1) {
      startPoint = evt.touches[0];
    } else {
      startPoint = null;
    }
  }
})();
function moveToNext(nextCell) {
  startTimer();
  //console.debug(LOGGER, currentCell);
  if (nextCell) {
    const currentX = gamestate.getViewX(gamestate.currentCell);
    const currentY = gamestate.getViewY(gamestate.currentCell);
    const targetX = gamestate.getViewX(nextCell);
    const targetY = gamestate.getViewY(nextCell);
    const deltaX = (currentX - targetX) / 8;
    const deltaY = (currentY - targetY) / 8;
    let step = 0;
    gamestate.moving = true;
    let playerChar = gamestate.img.getElementById('playerCharacter');
    if (playerChar) {
      gamestate.playerDir = gamestate.direction in view.player.directions
              ? view.player.directions[gamestate.direction]
              : {offsetX: 0, offsetY: 0, still: ''};
      playerChar.setAttribute('href', '#' + gamestate.playerDir.still);
    }

    function move() {
      ++step;
      let nextX = currentX - step * deltaX;
      let nextY = currentY - step * deltaY;
      if (Math.abs(nextX - targetX) < 0.1
              && (Math.abs(nextY - targetY) < 0.1)) {
        gamestate.currentCell = nextCell;
        gamestate.img.setAttribute('viewBox',
                (targetX) + ' ' + (targetY) + ' ' + gamestate.w + ' ' + gamestate.h);
        if (playerChar) {
          playerChar.setAttribute('x', targetX + gamestate.playerOffsetX + gamestate.playerDir.offsetX);
          playerChar.setAttribute('y', targetY + gamestate.playerOffsetY + gamestate.playerDir.offsetY);
        }
        gamestate.moving = false;
        //console.debug(LOGGER, "move", "done");
        if (nextCell === gamestate.targetCell) {
          gamestate.moving = true; // verhindert weitere Bewegung
          stopTimer();
          gamestate.playerDir = 'NORTH' in view.player.directions
                  ? view.player.directions['NORTH']
                  : {offsetX: 0, offsetY: 0, still: ''};
          playerChar.setAttribute('href', '#' + gamestate.playerDir.still);

          movePlayerOnly(playerChar,
                  targetY - gamestate.h + gamestate.playerOffsetY + gamestate.playerDir.offsetY, false);
        }
      } else {
        //console.debug(LOGGER, "move", "next");
        gamestate.img.setAttribute('viewBox',
                (nextX) + ' ' + (nextY) + ' ' + gamestate.w + ' ' + gamestate.h);
        if (playerChar) {
          let px = Number(playerChar.getAttribute('x'));
          playerChar.setAttribute('x', px - deltaX);
          let py = Number(playerChar.getAttribute('y'));
          playerChar.setAttribute('y', py - deltaY);
        }
        setTimeout(move, 66);
      }
    }
    setTimeout(move, 0);
  }
}

setTimeout(initializeGame, 0);