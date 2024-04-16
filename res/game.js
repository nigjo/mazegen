import MazeGen from './RandomKruskal.js';
import MazeView from './v_topdown.js';

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
const q = new URLSearchParams(location.search);
if (q.has('seed'))
  docrunner.Seed = q.get('seed');
if (q.has('w'))
  docrunner.Width = q.get('w');
if (q.has('h'))
  docrunner.Height = q.get('h');
console.log('GAME', docrunner, q);

document.getElementById('seed').textContent = docrunner.Seed;
const maze = new MazeGen(Number(docrunner.Width), Number(docrunner.Height), docrunner.Seed);
const view = new MazeView(maze);

const startCell = maze.exit;
const targetCell = maze.entrance;

//console.debug('GAME', startCell, targetCell);

let wrapper = document.createElement('div');
wrapper.className = 'mazeview';
let shadow = wrapper.attachShadow({
  mode: 'open'
});
let img = view.create();
shadow.append(img);
if (img.hasAttribute('width'))
  wrapper.dataset.width = Number(img.getAttribute('width')) + 'px';
if (img.hasAttribute('height'))
  wrapper.dataset.height = Number(img.getAttribute('height')) + 'px';

let w = Number(view.cellWidth);
let h = Number(view.cellHeight);
let oX = Number(view.offsetX);
let oY = Number(view.offsetY);

const startX = oX + w * startCell.col;
const startY = oY + h * startCell.row;
img.setAttribute('width', w * 4);
img.setAttribute('height', h * 4);
img.setAttribute('viewBox',
        startX + ' ' + startY + ' ' + w + ' ' + h);
img.setAttribute('part', 'mazeview');

let playerOffsetX = 0;
let playerOffsetY = 0;
let direction = 'NORTH';
let moving = false;

if (view.hasPlayer) {
  console.debug(view.player);
  let dir = view.player.directions[direction];
  playerOffsetX = "playerOffsetX" in view
          ? view.playerOffsetX : (w / 2);
  playerOffsetY = "playerOffsetY" in view
          ? view.playerOffsetY : (h / 2);
  let player = document.createElementNS(img.namespaceURI, 'use');
  player.setAttribute('id', 'playerCharacter');
  player.setAttribute('href', '#' + dir.still);
  player.setAttribute('x', startX + playerOffsetX + dir.offsetX);
  player.setAttribute('y', startY + h + playerOffsetY + dir.offsetY);
  img.append(player);
  let targetY = startY + playerOffsetY + dir.offsetY;
  movePlayerOnly(player, targetY, true);
}
(() => {
  let rsg = ['Ready.', 'Steady.', 'GO!'];
  const tick = (24 * 75) / rsg.length;
  const ui = document.getElementById('timer');
  function ticker() {
    console.log('this', this);
    let token = rsg.shift();
    ui.textContent = ui.textContent + ' ' + token;
    if (rsg.length > 0)
      setTimeout(ticker, tick);
  }

  setTimeout(ticker, tick);
})();

function movePlayerOnly(player, targetY, moveAfter) {
  let playerY = Number(player.getAttribute('y'));
  moving = true;
  const deltaY = (targetY - playerY) / 24;
  function movePlayerToStart() {
    playerY = playerY + deltaY;
    if (Math.abs(playerY - targetY) < 0.1) {
      player.setAttribute('y', targetY);
      moving = !moveAfter;
    } else {
      player.setAttribute('y', playerY);
      setTimeout(movePlayerToStart, 75);
    }
  }
  setTimeout(movePlayerToStart, 0);
}


document.querySelector('main .game').append(wrapper);
try {
  document.querySelector('main').append(new DebugView(maze).create());
} catch (e) {
  console.debug("debug mode disabled");
}

let currentCell = startCell;
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
    a.href = './view.html?' + new URLSearchParams({workshopSeed:docrunner.Seed});
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
  if (moving) {
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
  switch (evt.key) {
    case 'ArrowUp':
      //if(currentCell.wall)
      if ((currentCell.walls & MazeGen.NORTH) === 0) {
        direction = 'NORTH';
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.NORTH);
      }
      break;
    case 'ArrowLeft':
      if ((currentCell.walls & MazeGen.WEST) === 0) {
        direction = 'WEST';
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.WEST);
      }
      break;
    case 'ArrowDown':
      if ((currentCell.walls & MazeGen.SOUTH) === 0) {
        direction = 'SOUTH';
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.SOUTH);
      }
      break;
    case 'ArrowRight':
      if ((currentCell.walls & MazeGen.EAST) === 0) {
        direction = 'EAST';
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.EAST);
      }
      break;
    default:
      return;
  }
  evt.preventDefault();
  moveToNext(nextCell);
});

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
    //console.log("END", startPoint, evt.changedTouches[0]);
    let deltaX = evt.changedTouches[0].pageX - startPoint.pageX;
    let deltaY = evt.changedTouches[0].pageY - startPoint.pageY;
    //console.log('DELTA', deltaX, deltaY);
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      return;
    }
    let nextCell = null;
    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      if (deltaY > 0) {
        if ((currentCell.walls & MazeGen.NORTH) === 0) {
          direction = 'NORTH';
          nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.NORTH);
        }
      } else {
        if ((currentCell.walls & MazeGen.SOUTH) === 0) {
          direction = 'SOUTH';
          nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.SOUTH);
        }
      }
    } else {
      if (deltaX > 0) {
        if ((currentCell.walls & MazeGen.WEST) === 0) {
          direction = 'WEST';
          nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.WEST);
        }
      } else {
        if ((currentCell.walls & MazeGen.EAST) === 0) {
          direction = 'EAST';
          nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.EAST);
        }
      }
    }
    moveToNext(nextCell);
  }
  startPoint = null;
}
function handleTouchStart(evt) {
  console.log("START");
  evt.preventDefault();
  if (!moving && evt.touches.length === 1) {
    startPoint = evt.touches[0];
  } else {
    startPoint = null;
  }
}

function moveToNext(nextCell) {
  startTimer();
  //console.debug(currentCell);
  if (nextCell) {
    const currentX = oX + w * currentCell.col;
    const currentY = oY + h * currentCell.row;
    const targetX = oX + w * nextCell.col;
    const targetY = oY + h * nextCell.row;
    const deltaX = (currentX - targetX) / 8;
    const deltaY = (currentY - targetY) / 8;
    let step = 0;
    moving = true;
    let playerChar = img.getElementById('playerCharacter');
    let playerDir = null;
    if (playerChar) {
      playerDir = direction in view.player.directions
              ? view.player.directions[direction]
              : {offsetX: 0, offsetY: 0, still: ''};
      playerChar.setAttribute('href', '#' + playerDir.still);
    }

    function move() {
      ++step;
      let nextX = currentX - step * deltaX;
      let nextY = currentY - step * deltaY;
      if (Math.abs(nextX - targetX) < 0.1
              && (Math.abs(nextY - targetY) < 0.1)) {
        currentCell = nextCell;
        img.setAttribute('viewBox',
                (targetX) + ' ' + (targetY) + ' ' + w + ' ' + h);
        if (playerChar) {
          playerChar.setAttribute('x', targetX + playerOffsetX + playerDir.offsetX);
          playerChar.setAttribute('y', targetY + playerOffsetY + playerDir.offsetY);
        }
        moving = false;
        //console.debug('GAME', "move", "done");
        if (nextCell === targetCell) {
          moving = true; // verhindert weitere Bewegung
          stopTimer();
          playerDir = 'NORTH' in view.player.directions
                  ? view.player.directions['NORTH']
                  : {offsetX: 0, offsetY: 0, still: ''};
          playerChar.setAttribute('href', '#' + playerDir.still);

          movePlayerOnly(playerChar,
                  targetY - h + playerOffsetY + playerDir.offsetY, false);
        }
      } else {
        //console.debug('GAME', "move", "next");
        img.setAttribute('viewBox',
                (nextX) + ' ' + (nextY) + ' ' + w + ' ' + h);
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
