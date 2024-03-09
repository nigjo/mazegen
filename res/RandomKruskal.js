import Maze from './m_maze.js';

export default class RandomKruskal extends Maze {
  generate(rng) {
    let c = this.cells;
    let groups = c.flat().map(i => Array(i));
    //console.log("groups", groups);
    let walls = [];
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (r > 0)
          walls.push({
            c0: this.cells[r - 1][c],
            c1: this.cells[r][c]
          });
        if (c > 0)
          walls.push({
            c0: this.cells[r][c - 1],
            c1: this.cells[r][c]
          });
      }
    }

    //console.log("walls", walls);
    while (walls.length > 0) {
      let wall = walls.splice(rng(walls.length), 1);
      //console.debug(wall[0]);
      let g1 = groups.findIndex(g => g.includes(wall[0].c0));
      let g2 = groups.findIndex(g => g.includes(wall[0].c1));
      if (g1 !== g2) {
        this.removeWall(wall[0].c0, wall[0].c1);
        groups[g1].push(...groups[g2]);
        groups.splice(g2, 1);
      }
    }
  }
}

//let rndK = new RandomKruskal(12, 8, "Hallo");
//console.log(rndK);
//console.log(createTextMaze(rndK).textContent);
