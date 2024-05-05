class Cell {
  //Maze parent;
  constructor(parent) {
    this.parent = parent;

    this.row = -1;
    this.col = -1;
    this.walls = -1;
  }
}


/**
 * @class Ein Irrgarten
 */
export default class Maze {
  static NORTH = 1;
  static EAST = 2;
  static SOUTH = 4;
  static WEST = 8;

  #cells = null;
  #entrance = null;
  #exit = null;

  static randomGenerator(seed) {
    let a = seed;
    let rnd = function () {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    return (max = 2) => Math.floor(rnd() * max);
  }

  /**
   * @argument {number} width 
   * @argument {number} height
   * @argument {string|number} seed
   */
  constructor(width, height, seed = null) {
    /**@type number */
    let usedSeed = null;
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
    } else if (typeof (seed) === 'number') {
      usedSeed = seed;
    }
    usedSeed = usedSeed !== null ? usedSeed : (width * height * 51);
    this.seed = usedSeed;
    //console.debug('width:', width, 'height:', height, 'seed:', seed, usedSeed);

    this.width = width;
    this.height = height;
    this.#cells = Array(height);
    let allWalls = Maze.NORTH | Maze.EAST | Maze.SOUTH | Maze.WEST;
    for (let r = 0; r < height; r++) {
      this.#cells[r] = Array(width);
      for (let c = 0; c < width; c++) {
        this.#cells[r][c] = new Cell(this);
        this.#cells[r][c].row = r;
        this.#cells[r][c].col = c;
        this.#cells[r][c].walls = allWalls;
      }
    }
    console.debug('MAZE', 'initialized');
  }

  #ensureMazedata() {
    if (!this.#entrance) {
      let rng = Maze.randomGenerator(this.seed);
      this._setEntrance(this.#cells[0][1 + rng(this.width - 2)]);
      this._setExit(this.#cells[this.height - 1][1 + rng(this.width - 2)]);

      console.debug('MAZE', 'generating');
      this.generate(rng, this.#cells);
    }
  }

  _setEntrance(cell) {
    if (cell.row !== 0) {
      throw new Error('entrance must be in the top row');
    }
    if (cell !== this.#entrance) {
      if (this.#entrance){
        console.debug('MAZE', this.#entrance.walls);
        this.#entrance.walls |= Maze.NORTH;
        console.debug('MAZE', this.#entrance.walls);
      }
      this.#entrance = cell
      this.#entrance.walls ^= Maze.NORTH;
    }
  }
  _setExit(cell) {
    if (cell.row !== this.height - 1) {
      throw new Error('exist must be in the bottom row');
    }
    if (cell !== this.#exit) {
      if (this.#exit)
        this.#exit.walls |= Maze.SOUTH;
      this.#exit = cell
      this.#exit.walls ^= Maze.SOUTH;
    }
  }

  get entrance() {
    this.#ensureMazedata();
    return this.#entrance;
  }
  get exit() {
    this.#ensureMazedata();
    return this.#exit;
  }
  get cells() {
    this.#ensureMazedata();
    return this.#cells;
  }

  getNeighbour(cell, direction) {
    switch (direction) {
      case Maze.NORTH:
        if (cell.row === 0)
          return undefined;
        return this.cells[cell.row - 1][cell.col];
      case Maze.SOUTH:
        if (cell.row + 1 >= this.height)
          return undefined;
        return this.cells[cell.row + 1][cell.col];
      case Maze.WEST:
        if (cell.col === 0)
          return undefined;
        return this.cells[cell.row][cell.col - 1];
      case Maze.EAST:
        if (cell.col + 1 >= this.width)
          return undefined;
        return this.cells[cell.row][cell.col + 1];
    }
    return undefined;
  }

  /**
   * @return {boolean|undefined} Bei Nachbarn wird true oder false geliefert.
   * Sind die Zellen keine Nachbarn gibt es "undefined"
   */
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

