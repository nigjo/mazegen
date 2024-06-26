/* 
 * Copyright 2024 nigjo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import MazeGen from './RandomKruskal.js';
import MazeView from './v_topdown.js';
import settings from './m_usersettings.js';
import LM from './m_lang.js';

const LOGGER = 'GAME';
//console.debug(LOGGER, LM);

const docrunner = {
  Width: String(settings.width),
  Height: String(settings.height),
  Seed: (() => {
    let timestamp = new Date();
    timestamp.setMinutes(0);
    return timestamp
            .toISOString()
            .substring(0, 16).replace('T', ' ') + 'z';
  })()
};
(() => {
  console.debug(LOGGER, "init");
  docrunner.Width = String(settings.width);
  docrunner.Height = String(settings.height);

  const q = new URLSearchParams(location.search);
  if (q.has('seed'))
    docrunner.Seed = q.get('seed');
  if (q.has('width'))
    docrunner.Width = q.get('width');
  if (q.has('height'))
    docrunner.Height = q.get('height');
  if ('true' === q.get('code')) {
    setTimeout(() => {
      console.debug(LOGGER, 'adding QR Code');
      const img = `<img id="qrcode" src="res/qr-code.png"
       alt="QR-Code to https://nigjo.github.io/mazegen/"/>`;
      document.querySelector('nav').innerHTML = img;
    });
  }
  console.log(LOGGER, docrunner);
})();

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// MAZE
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
document.getElementById('seed').textContent = docrunner.Seed;
const maze = new MazeGen(Number(docrunner.Width), Number(docrunner.Height), docrunner.Seed);
const view = new MazeView(maze);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// GAMESTATE
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const gamestate = {
  startCell: maze.exit,
  targetCell: maze.entrance,
  currentCell: null,
  moving: true,
  direction: 'NORTH',
  playerDir: null,
  getViewCell: () => gamestate.img.querySelector('.maze').children[gamestate.currentCell.row].children[gamestate.currentCell.col],
  getViewX: (cell) => gamestate.oX + gamestate.cw * cell.col,
  getViewY: (cell) => gamestate.oY + gamestate.ch * cell.row,
  viewBox: (x, y) => {
    return [
      Math.max(0, Math.min(x - gamestate.dx, gamestate.maxWidth)),
      Math.max(0, Math.min(y - gamestate.dy, gamestate.maxHeight)),
      gamestate.viewWidth,
      gamestate.viewHeight
    ].join(' ');
  }
};
gamestate.currentCell = gamestate.startCell;
gamestate.checkFinish = () => {
  switch (settings.mode) {
    case 'search':
      if (gamestate.currentCell === gamestate.targetCell) {
        console.debug(LOGGER, 'checkFinish', settings.mode, gamestate.collectableItems);
        return gamestate.collectableItems <= 0;
      }
      break;
    case 'default':
    case 'timing':
    default:
      if (gamestate.currentCell === gamestate.targetCell) {
        console.debug(LOGGER, 'checkFinish', settings.mode);
        return true;
      }
  }
  return false;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// GAME INIT
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//console.debug(LOGGER, gamestate.startCell, gamestate.targetCell);
function initializeGame() {
  let wrapper = document.createElement('div');
  wrapper.className = 'mazeview';
  let shadow = wrapper.attachShadow({
    mode: 'open'
  });
  var img = view.create();
  shadow.append(img);
  gamestate.vbWidth = Number(img.getAttribute('viewBox').split(' ')[2]);
  gamestate.vbHeight = Number(img.getAttribute('viewBox').split(' ')[3]);
  if (img.hasAttribute('width')) {
    gamestate.width = Number(img.getAttribute('width'));
  } else {
    gamestate.width = gamestate.vbWidth;
  }
  if (img.hasAttribute('height')) {
    gamestate.height = Number(img.getAttribute('height'));
  } else {
    gamestate.height = gamestate.vbHeight;
  }

  //console.debug(LOGGER, img.getAttributeNames().map(n => [n, img.getAttribute(n)]));

  wrapper.dataset.height = gamestate.height + 'px';
  wrapper.dataset.width = gamestate.width + 'px';

  gamestate.cw = Number(view.cellWidth);
  gamestate.ch = Number(view.cellHeight);
  gamestate.oX = Number(view.offsetX);
  gamestate.oY = Number(view.offsetY);
  gamestate.viewWidth = gamestate.cw;//* 1.125;
  gamestate.viewHeight = gamestate.ch;//* 1.125;
  gamestate.dx = (gamestate.viewWidth - gamestate.cw) / 2;
  gamestate.dy = (gamestate.viewHeight - gamestate.ch) / 2;
  gamestate.maxWidth = gamestate.vbWidth - gamestate.viewWidth;
  gamestate.maxHeight = gamestate.vbHeight - gamestate.viewHeight;

  //console.debug(LOGGER, gamestate);

  const startX = gamestate.getViewX(gamestate.startCell);
  const startY = gamestate.getViewY(gamestate.startCell);
  img.setAttribute('width', gamestate.cw * 4);
  img.setAttribute('height', gamestate.ch * 4);
  img.setAttribute('viewBox', gamestate.viewBox(startX, startY));
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
            ? view.playerOffsetX : (gamestate.cw / 2);
    gamestate.playerOffsetY = "playerOffsetY" in view
            ? view.playerOffsetY : (gamestate.ch / 2);
    let player = document.createElementNS(img.namespaceURI, 'use');
    player.setAttribute('id', 'playerCharacter');
    player.setAttribute('href', '#' + dir.still);
    player.setAttribute('x', startX + gamestate.playerOffsetX + dir.offsetX);
    player.setAttribute('y', startY + gamestate.viewHeight + gamestate.playerOffsetY + dir.offsetY);
    img.append(player);
    let targetY = startY + gamestate.playerOffsetY + dir.offsetY;
    movePlayerOnly(player, targetY, true);
  }
  document.querySelector('main #game').append(wrapper);

  document.dispatchEvent(new CustomEvent('docksrunner.generated'));

  if (view.hasPlayer) {
    entranceOfThePlayer();
  }
}

function entranceOfThePlayer() {
  let rsg = [
    LM.message('init.ready'),
    LM.message('init.steady'),
    LM.message('init.go')];
  console.debug(LOGGER, rsg.join(' '));
  const tick = (24 * 75) / rsg.length;
  const ui = document.getElementById('timer');
  function ticker() {
    let token = rsg.shift();
    ui.textContent = ui.textContent + ' ' + token;
    if (rsg.length > 0)
      setTimeout(ticker, tick);
    else {
      console.log(LOGGER, LM.message('init.go'));
      gamestate.moving = false;
    }
  }

  ui.textContent = ' ';
  setTimeout(ticker, tick);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// TIMING MANAGER
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
  if (sec >= 60) {
    ui.textContent = LM.message('time_elapsed_min', Math.floor(sec / 60), sec % 60);
  } else {
    ui.textContent = LM.message('time_elapsed', sec);
  }
  //let text = (sec >= 60 ? Math.floor(sec / 60) + 'm ' : '') + (sec % 60) + 's';
  if (gamestate.score) {
    document.getElementById('points').textContent
            = LM.message('current_points', String(gamestate.score));
  }
  if (gamestate.message) {
    document.getElementById('message').textContent
            = String(gamestate.message);
  } else {
    document.getElementById('message').textContent = '';
  }

  if (timer) {
    timer = setTimeout(updateTimer, 150);
  } else {
    document.getElementById('game').classList.add('done');

    const nav = document.createElement('div');
    nav.id = "scoreboard";

    let viewLink = document.createElement('a');
    viewLink.className = 'bgWay button';
    let next = {seed: docrunner.Seed};
    const q = new URLSearchParams(location.search);
    if (q.has('width'))
      next.width = docrunner.Width;
    if (q.has('height'))
      next.height = docrunner.Height;
    viewLink.href = './view.html?' + new URLSearchParams(next);

    viewLink.textContent = LM.message('scoreboard.time', ui.textContent);
    const navline1 = document.createElement('div');
    navline1.append(viewLink);

    const ptsUi = document.getElementById('points');
    let points = document.createElement('div');
    points.className = 'bgWay button';
    points.href = './?' + new URLSearchParams(next);
    points.textContent = LM.message('scoreboard.points', ptsUi.textContent);
    navline1.append(points);

    nav.append(navline1);
    let navline2 = document.createElement('div');

    let restartLink = document.createElement('a');
    restartLink.className = 'bgWay button';
    restartLink.href = './?' + new URLSearchParams(next);
    restartLink.textContent = LM.message('scoreboard.replay');
    navline2.append(restartLink);

    let randomLink = document.createElement('a');
    let alphabeth = "abcdefghijklmnopqrstuvwxyz";
    alphabeth += alphabeth.toUpperCase();
    alphabeth += " +-._#~!";
    alphabeth += "0123456789";
    let seed = '';
    for (let i = 0; i < 16; i++) {
      seed += alphabeth.charAt(Math.random() * alphabeth.length);
    }
    next.seed = seed;
    randomLink.className = 'bgWay button';
    randomLink.href = './?' + new URLSearchParams(next);
    randomLink.textContent = LM.message('scoreboard.random');
    navline2.append(randomLink);
    nav.append(navline2);

    document.getElementById('game').insertAdjacentElement('afterend', nav);
  }
}
function stopTimer() {
  timer = null;
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// COLLECTABLES
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function checkForCollectable() {
  const cell = gamestate.getViewCell();

  let collectables = cell.getElementsByClassName('collectable');
  if (collectables.length > 0) {
    const collectable = collectables.item(0);
    document.dispatchEvent(new CustomEvent('docksrunner.collected', {detail: {
        collectable: collectable,
        mazeCell: gamestate.currentCell
      }}
    ));
  }
}
document.addEventListener('docksrunner.generated', () => {
  let collectables = gamestate.img.getElementsByClassName('collectable');
  console.debug(LOGGER, collectables.length, 'collecteables');
  gamestate.collectableItems = collectables.length;
});
function handleCollectItem(evt) {
  const target = evt.detail.collectable;
  --gamestate.collectableItems;

  target.parentElement.dispatchEvent(new CustomEvent('docksrunner.collected', {detail: evt.detail}));
}
document.addEventListener('docksrunner.collected', handleCollectItem);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// GAME SCORES
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
document.addEventListener('docksrunner.score.add', (evt) => {
  gamestate.score = gamestate.score | 0;
  gamestate.score += Number(evt.detail.score);
  if (evt.detail.message) {
    if (gamestate.timer)
      clearTimeout(gamestate.timer);
    gamestate.message = evt.detail.message;
    gamestate.timer = setTimeout(() => {
      gamestate.message = null;
    }, 2000);
  }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// PLAYER MOVEMENT
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function movePlayerOnly(player, targetY, moveAfter) {
  let playerY = Number(player.getAttribute('y'));
  gamestate.moving = true;
  const deltaY = (targetY - playerY) / 24;
  function movePlayerToStart() {
    playerY = playerY + deltaY;
    if (Math.abs(playerY - targetY) < 0.1) {
      gamestate.direction = 'SOUTH';
      let dir = view.player.directions[gamestate.direction];
      //console.debug('GAME', gamestate.direction, dir);
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
        gamestate.img.setAttribute('viewBox', gamestate.viewBox(targetX, targetY));
        if (playerChar) {
          playerChar.setAttribute('x', targetX + gamestate.playerOffsetX + gamestate.playerDir.offsetX);
          playerChar.setAttribute('y', targetY + gamestate.playerOffsetY + gamestate.playerDir.offsetY);
        }
        gamestate.moving = false;
        //console.debug(LOGGER, "move", "done");
        if (gamestate.checkFinish()) {
          gamestate.moving = true; // verhindert weitere Bewegung
          stopTimer();
          gamestate.playerDir = 'NORTH' in view.player.directions
                  ? view.player.directions['NORTH']
                  : {offsetX: 0, offsetY: 0, still: ''};
          playerChar.setAttribute('href', '#' + gamestate.playerDir.still);

          movePlayerOnly(playerChar,
                  targetY - gamestate.viewHeight + gamestate.playerOffsetY + gamestate.playerDir.offsetY, false);
        }
      } else {
//console.debug(LOGGER, "move", "next");
        gamestate.img.setAttribute('viewBox', gamestate.viewBox(nextX, nextY));
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


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// KEY MANAGER
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
document.addEventListener('keydown', (evt) => {
  if (evt.isComposing || evt.keyCode === 229) {
//from mdn docs
    return;
  }
  if (gamestate.moving) {
    switch (evt.code) {
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'ArrowRight':
      case 'Space':
      case 'Enter':
        evt.preventDefault();
        return;
    }
  }
  let nextCell = null;
  let currentCell = gamestate.currentCell;
  switch (evt.code) {
    case 'Enter':
      checkForCollectable(currentCell);
      break;
    case 'Space':
      {
        let playerChar = gamestate.img.getElementById('playerCharacter');
        gamestate.direction = 'SOUTH';
        let dir = view.player.directions[gamestate.direction];
        playerChar.setAttribute('href', '#' + dir.still);
      }
      break;
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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// TOUCH MANAGER
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// initTouch
(() => {
  const el = document.querySelector('main #game');
  el.addEventListener("touchstart", handleTouchStart, {passive:false});
  el.addEventListener("touchend", handleTouchEnd, {passive:false});
  el.addEventListener("touchcancel", handleTouchEnd, {passive:false});
  el.addEventListener("touchmove", handleTouchMove, {passive:false});

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
        //Tapp?
        //console.log(LOGGER, evt);
        checkForCollectable();
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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Start game
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
setTimeout(initializeGame, 0);