import Maze from './m_maze.js';


/**
 * Erstellt folgenden Irrgarten. Es wurde versucht jede "Kachelart" einmal
 * vorkommen zu lassen.
 * 
 * <pre>
 * +---+-v-+---+---+---+
 * |   |       |       |
 * +   +---+   +   +   +
 * |           |   |   |
 * +   +   +---+   +---+
 * |   |   |           |
 * +---+   +---+---+   +
 * |                   |
 * +   +   +   +---+   +
 * |   |   |       |   |
 * +---+---+-v-+---+---+
 * </pre>
 */
export default class ThumbMaze extends Maze {

  constructor() {
    super(5, 5, 0);
  }

  generate() {
    this.entrance.walls += Maze.NORTH;
    this.entrance = this.cells[0][1];
    this.entrance.walls ^= Maze.NORTH;

    this.exit.walls += Maze.SOUTH;
    this.exit = this.cells[4][2];
    this.exit.walls ^= Maze.SOUTH;
    this.removeWall(this.cells[0][1], this.cells[0][2]);
    this.removeWall(this.cells[0][2], this.cells[1][2]);
    this.removeWall(this.cells[1][1], this.cells[1][2]);
    this.removeWall(this.cells[1][1], this.cells[1][0]);
    this.removeWall(this.cells[1][0], this.cells[0][0]);
    this.removeWall(this.cells[1][0], this.cells[2][0]);
    this.removeWall(this.cells[1][1], this.cells[2][1]);
    this.removeWall(this.cells[2][1], this.cells[3][1]);
    this.removeWall(this.cells[3][0], this.cells[3][1]);
    this.removeWall(this.cells[3][0], this.cells[4][0]);
    this.removeWall(this.cells[4][1], this.cells[3][1]);
    this.removeWall(this.cells[3][2], this.cells[3][1]);
    this.removeWall(this.cells[3][2], this.cells[3][3]);
    this.removeWall(this.cells[4][3], this.cells[4][2]);
    this.removeWall(this.cells[4][2], this.cells[3][2]);
    this.removeWall(this.cells[3][4], this.cells[3][3]);
    this.removeWall(this.cells[3][4], this.cells[4][4]);
    this.removeWall(this.cells[3][4], this.cells[2][4]);
    this.removeWall(this.cells[2][3], this.cells[2][4]);
    this.removeWall(this.cells[2][3], this.cells[2][2]);
    this.removeWall(this.cells[2][3], this.cells[1][3]);
    this.removeWall(this.cells[0][3], this.cells[1][3]);
    this.removeWall(this.cells[0][3], this.cells[0][4]);
    this.removeWall(this.cells[1][4], this.cells[0][4]);
    //this.cells[0][0].walls = 
  }
}
