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
console.log('GAME', docrunner);

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

img.setAttribute('width', w * 4);
img.setAttribute('height', h * 4);
img.setAttribute('viewBox',
        (oX + w * startCell.col) + ' '
        + (oY + h * startCell.row) + ' ' + w + ' ' + h);
img.setAttribute('part', 'mazeview');

document.querySelector('main .game').append(wrapper);
try {
  document.querySelector('main').append(new DebugView(maze).create());
} catch (e) {
  console.debug("debug mode disabled");
}

let currentCell = startCell;
let moving = false;
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
  ui.textContent = 'timer: ' + Math.floor(delta / 1000) + 's';
  if (timer) {
    timer = setTimeout(updateTimer, 150);
  } else {
    let a = document.createElement('a');
    a.href = './index.html?width=6&height=10&view=view5000';
    a.textContent = ui.textContent + " / done";
    ui.replaceChildren(a);
  }
}
function stopTimer() {
  timer = null;
}

document.addEventListener('keydown', (evt) => {
  if (event.isComposing || event.keyCode === 229) {
    //from mdn docs
    return;
  }
  if (moving) {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        return;
    }
  }
  let nextCell = null;
  switch (event.key) {
    case 'ArrowUp':
      //if(currentCell.wall)
      if ((currentCell.walls & MazeGen.NORTH) === 0) {
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.NORTH);
      }
      break;
    case 'ArrowLeft':
      if ((currentCell.walls & MazeGen.WEST) === 0) {
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.WEST);
      }
      break;
    case 'ArrowDown':
      if ((currentCell.walls & MazeGen.SOUTH) === 0) {
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.SOUTH);
      }
      break;
    case 'ArrowRight':
      if ((currentCell.walls & MazeGen.EAST) === 0) {
        nextCell = currentCell.parent.getNeighbour(currentCell, MazeGen.EAST);
      }
      break;
    default:
      return;
  }
  event.preventDefault();

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

    function move() {
      ++step;
      let nextX = currentX - step * deltaX;
      let nextY = currentY - step * deltaY;
      if (Math.abs(nextX - targetX) < 0.1
              && (Math.abs(nextY - targetY) < 0.1)) {
        currentCell = nextCell;
        img.setAttribute('viewBox',
                (targetX) + ' ' + (targetY) + ' ' + w + ' ' + h);
        moving = false;
        //console.debug('GAME', "move", "done");
        if (nextCell === targetCell) {
          moving = true; // verhindert weitere Bewegung
          stopTimer();
        }
      } else {
        //console.debug('GAME', "move", "next");
        img.setAttribute('viewBox',
                (nextX) + ' ' + (nextY) + ' ' + w + ' ' + h);
        setTimeout(move, 66);
      }
    }
    setTimeout(move, 0);
  }
});
