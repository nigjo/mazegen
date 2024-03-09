import Maze from './m_maze.js';

export default class TextView {

  constructor(maze) {
    this.maze = maze;
  }

  create() {
    let m = this.maze;
    let pre = document.createElement('pre');
    let sep = '+' + '---+'.repeat(m.width) + '\n';
    let idx = m.entrance.col * 4 + 2;
    pre.append(sep.substring(0, idx), '\u2193', sep.substring(idx + 1));
    for (let r = 0; r < m.height; r++) {
      let cells = '|';
      let line = '+';
      for (let c = 0; c < m.width; c++) {
        let cell = m.cells[r][c];
        cells += "   ";
        if ((cell.walls & Maze.EAST) !== 0) {
          cells += "|";
        } else {
          cells += " ";
        }
        if ((cell.walls & Maze.SOUTH) !== 0) {
          line += "---+";
        } else if (cell === m.exit) {
          line += " \u2193 +";
        } else {
          line += "   +";
        }
      }
      pre.append(cells + "\n");
      pre.append(line + "\n");
    }
    return pre;
  }

}