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
import Maze from './m_maze.js';

const LOGGER = 'CCM';

/**
 * Generates a maze from a "Maze-Code-String".
 * 
 *  - the string starts with "MC"
 *  - all other characters of the string are hex values.
 *  - the first char definies the "Version" of the "MazeCode" used.
 *  - the next two defines the maze's width.
 *  - the next two defines the maze's entrance column.
 *  - the next two defines the maze's exit column.
 *  - all others are 1 char per cell.
 *  - rows in odd width mazes are padded with a 'f'
 *  
 */
export default class CellcodeMaze extends Maze {
  static #dataOffset = 'MCVWWEEXX'.length;
  constructor(code) {
    if (!code.startsWith('MC')) {
      throw new Error('not a valid maze code: ' + code);
    }
    const version = Number('0x' + code.substring(2, 3));
    if (version !== 2) {
      throw new Error('unknown maze code version : ' + version);
    }

    const width = Number('0x' + code.substring(3, 5));
    const rowLen = width + width % 2;
    const height = (code.length - CellcodeMaze.#dataOffset) / rowLen;

    super(width, height, code);
    this.code = code;

    console.debug(LOGGER, this);
  }

  generate(rng, cells) {
    const dataOffset = CellcodeMaze.#dataOffset;
    console.debug(LOGGER, dataOffset);
    const rowLen = this.width + this.width % 2;
    for (var r = 0; r < this.height; r++) {
      for (var c = 0; c < this.width; c++) {
        let cellWalls =
                Number('0x' + this.code[dataOffset + rowLen * r + c]);
        //this.#cells[r][c].walls =
        if (r > 0 && (cellWalls & Maze.NORTH) === 0) {
          super.removeWall(cells[r][c], cells[r - 1][c]);
        }
        if (c > 0 && (cellWalls & Maze.WEST) === 0) {
          super.removeWall(cells[r][c], cells[r][c - 1]);
        }
      }
    }
    console.debug(LOGGER, this.code.substring(5,7), cells[0][Number(this.code.substring(5,7))]);
    this._setEntrance(cells[0][Number(this.code.substring(5,7))]);
    this._setExit(cells[cells.length-1][Number(this.code.substring(7,9))]);
  }
}
