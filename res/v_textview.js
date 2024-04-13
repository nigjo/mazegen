import Maze from './m_maze.js';

export default class TextView {

  static viewProps = ['boxView', 'showWay'];

  constructor(maze) {
    this.maze = maze;
    this.boxView = false;
    this.showWay = false;
  }

  create() {
    this.showWay = this.showWay === undefined ? this.boxView : this.showWay
    if (this.boxView) {
      return this.createBoxed();
    } else {
      return this.createAscii();
    }
  }

  createAscii() {
    let m = this.maze;
    let pre = document.createElement('pre');
    let sep = '+' + '---+'.repeat(m.width) + '\n';
    let idx = m.entrance.col * 4 + 2;
    pre.append(sep.substring(0, idx), 'v', sep.substring(idx + 1));
    for (let r = 0; r < m.height; r++) {
      let cells = '|';
      let line = '+';
      for (let c = 0; c < m.width; c++) {
        let cell = m.cells[r][c];
        cells += this.showWay ? " · " : "   ";
        if ((cell.walls & Maze.EAST) !== 0) {
          cells += "|";
        } else {
          cells += this.showWay ? "·" : " ";
        }
        if ((cell.walls & Maze.SOUTH) !== 0) {
          line += "---+";
        } else if (cell === m.exit) {
          line += "-v-+";
        } else {
          line += (this.showWay ? " · " : "   ")+"+";
        }
      }
      pre.append(cells + "\n");
      pre.append(line + "\n");
    }
    return pre;
  }

  createBoxed() {
    let m = this.maze;
    let pre = document.createElement('pre');
    let sep = '\u2554'
            + '\u2550\u2550\u2550\u2564'.repeat(m.width - 1)
            + '\u2550\u2550\u2550\u2557\n';

    let idx = m.entrance.col * 4 + 2;
    pre.append(sep.substring(0, idx), '\u2193', sep.substring(idx + 1));
    for (let r = 0; r < m.height; r++) {
      let lastRow = r + 1 == m.height;
      let cells = '\u2551';
      let line = lastRow ? '\u255a' : '\u255f';
      for (let c = 0; c < m.width; c++) {
        let lastCol = c + 1 == m.width;
        let cell = m.cells[r][c];
        cells += this.showWay ? " · " : "   ";
        if ((cell.walls & Maze.EAST) !== 0) {
          cells += lastCol ? "\u2551" : "\u2502";
        } else {
          cells += this.showWay ? "·" : " ";
        }
        if ((cell.walls & Maze.SOUTH) !== 0) {
          if (lastRow) {
            line += "\u2550\u2550\u2550" + (lastCol ? "\u255d" : "\u2567");
          } else {
            line += "\u2500\u2500\u2500" + (lastCol ? "\u2562" : "\u253c");
          }
        } else if (cell === m.exit) {
          line += "\u2550\u2193\u2550\u2567";
        } else {
          line += this.showWay ? " · " : "   ";
          line += (lastCol ? "\u2562" : "\u253c");
        }
      }
      pre.append(cells + "\n");
      pre.append(line + "\n");
    }
    return pre;
  }

}
function boxed(m) {
  let box = new TextView(m);
  box.boxView = true;
  box.showWay = true;
  return box;
}

if (window.mazedata) {
  import("./m_mazeinfo.js").then(mod => {
    let mazeinfo = mod.default;
    mazeinfo.registerView(2200, {
      displayName: "Asciitext",
      generator: m => new TextView(m)
    });
    mazeinfo.registerView(2100, {
      displayName: "Textansicht",
      generator: boxed
    });
  });
}
