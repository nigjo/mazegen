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

const SVGNS = 'http://www.w3.org/2000/svg';

export const asset = {
  view: 'stones.svg',
  tiles: {
    wallBottom: {validator: () => false},
    wallLeft: {validator: () => false},
    wallRight: {validator: () => false}
  },
  tail: (svg, maze, rng) => {
    //let exitCol = maze.exit.col;
    const m = svg.querySelector('.maze');
    let row = m.firstElementChild;
    //console.debug('STONES', maze.constructor);
    const addStones = (parent, id, x, y) => {
      let l = document.createElementNS(SVGNS, 'use');
      l.setAttribute('href', id);
      l.setAttribute('x', x);
      l.setAttribute('y', y);
      parent.querySelector('.boden')
              .insertAdjacentElement('afterend', l);
    };
    while (row.nextElementSibling) {
      //links und rechts die Steine setzen
      addStones(row.firstElementChild, '#stonesLeft', 0, 0);
      addStones(row.lastElementChild, '#stonesRight', 56, 0);
      //next
      row = row.nextElementSibling;
    }
    //console.debug('STONES', row);
    addStones(row.lastElementChild, '#stonesRight', 56, 0);
    [...row.children].forEach(c => addStones(c, '#stonesBottom', 0, 56));
    addStones(row.firstElementChild, '#stonesLeft', 0, 0);
  }
};