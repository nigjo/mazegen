class Cell {
  //Maze parent;
  constructor(parent) {
    this.parent = parent;
  }
}


export default class Maze {
  static NORTH = 1;
  static EAST = 2;
  static SOUTH = 4;
  static WEST = 8;

  constructor(width, height, seed = null) {
    let usedSeed=null;
    if (typeof (seed) === 'string')
    {
      if (seed.match(/^\d+$/)) {
        usedSeed = Number(seed);
      } else {
        //function hashCode(){
        usedSeed = ((s) => {
          var hash = 0, i, chr;
          if (s.length === 0)
            return hash;
          for (i = 0; i < s.length; i++) {
            chr = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
          }
          return hash;
        })(seed);
      }
    }
    usedSeed = usedSeed !== null ? usedSeed : (width * height * 51);
    console.debug('width:', width, 'height:', height, 'seed:', seed, usedSeed);

    let rng = ((a) => {
      let rnd = function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
      return (max = 2) => Math.floor(rnd() * max);
    })(usedSeed);

    this.width = width;
    this.height = height;
    this.cells = Array(height);
    let allWalls = Maze.NORTH | Maze.EAST | Maze.SOUTH | Maze.WEST;
    for (let r = 0; r < height; r++) {
      this.cells[r] = Array(width);
      for (let c = 0; c < width; c++) {
        this.cells[r][c] = new Cell(this);
        this.cells[r][c].row = r;
        this.cells[r][c].col = c;
        this.cells[r][c].walls = allWalls;
      }
    }

    this.entrance = this.cells[0][1 + rng(width - 2)];
    this.entrance.walls ^= Maze.NORTH;
    this.exit = this.cells[height - 1][1 + rng(width - 2)];
    this.exit.walls ^= Maze.SOUTH;

    this.generate(rng);
  }

  getNeighbour(cell, direction) {
    switch (direction) {
      case Maze.NORTH:
        if (cell.row === 0)
          return undefined;
        return this.cells[cell.row - 1][cell.col];
      case Maze.SOUTH:
        if (cell.row + 1 < this.height)
          return undefined;
        return this.cells[cell.row + 1][cell.col];
      case Maze.WEST:
        if (cell.col === 0)
          return undefined;
        return this.cells[cell.row][cell.col - 1];
      case Maze.EAST:
        if (cell.col + 1 < this.width)
          return undefined;
        return this.cells[cell.row][cell.col + 1];
    }
    return undefined;
  }

  hasWall(cell1, cell2) {
    if (cell1.row === cell2.row) {
      //gleiche Zeile
      let colDelta = cell1.col - cell2.col;
      if (colDelta === 1) {
        return 0 !== (cell1.walls & Maze.WEST);
      } else if (colDelta === -1) {
        return 0 !== (cell1.walls & Maze.EAST);
      }
    } else if (cell1.col === cell2.col) {
      //gleiche Spalte
      let rowDelta = cell1.row - cell2.row;
      if (rowDelta === 1) {
        return 0 !== (cell1.walls & Maze.NORTH);
      } else if (rowDelta === -1) {
        return 0 !== (cell1.walls & Maze.SOUTH);
      }
    }
    return undefined;
  }
  removeWall(cell1, cell2) {
    if (cell1.row === cell2.row) {
      //gleiche Zeile
      let colDelta = cell1.col - cell2.col;
      if (colDelta === 1) {
        cell1.walls ^= Maze.WEST;
        cell2.walls ^= Maze.EAST;
      } else if (colDelta === -1) {
        cell1.walls ^= Maze.EAST;
        cell2.walls ^= Maze.WEST;
      }
    } else if (cell1.col === cell2.col) {
      //gleiche Spalte
      let rowDelta = cell1.row - cell2.row;
      if (rowDelta === 1) {
        cell1.walls ^= Maze.NORTH;
        cell2.walls ^= Maze.SOUTH;
      } else if (rowDelta === -1) {
        cell1.walls ^= Maze.SOUTH;
        cell2.walls ^= Maze.NORTH;
      }
    }
  }

  generate(rng) {
    console.error('no generator defined. Please use a subclass');
  }
}


//const m51=new Maze(12, 8, 51);
//console.log(m51);
//console.log(createTextMaze(m51).textContent);

