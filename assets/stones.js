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
    let lastrow = row;
    while (row) {
      //links und rechts die Steine setzen
      if (row.firstElementChild.getElementsByClassName('wallTop').length > 0) {
        if (row.nextElementSibling && row.firstElementChild.getElementsByClassName('wallBottom').length > 0)
          addStones(row.firstElementChild, '#stonesLeftGapTB', 0, 0);
        else
          addStones(row.firstElementChild, '#stonesLeftGapT', 0, 0);
      } else if (row.nextElementSibling && row.firstElementChild.getElementsByClassName('wallBottom').length > 0) {
        addStones(row.firstElementChild, '#stonesLeftGapB', 0, 0);
      } else {
        addStones(row.firstElementChild, '#stonesLeft', 0, 0);
      }

      if (row.lastElementChild.getElementsByClassName('wallTop').length > 0) {
        if (row.nextElementSibling && row.lastElementChild.getElementsByClassName('wallBottom').length > 0)
          addStones(row.lastElementChild, '#stonesRightGapTB', 56, 0);
        else
          addStones(row.lastElementChild, '#stonesRightGapT', 56, 0);
      } else if (row.nextElementSibling && row.lastElementChild.getElementsByClassName('wallBottom').length > 0) {
        addStones(row.lastElementChild, '#stonesRightGapB', 56, 0);
      } else {
        addStones(row.lastElementChild, '#stonesRight', 56, 0);
      }

      //next
      lastrow = row;
      row = row.nextElementSibling;
    }
    //console.debug('STONES', row);
    [...lastrow.children].forEach((c, i) => {
      //console.debug('STONES', c);
      if (i > 0 && c.getElementsByClassName('wallLeft').length > 0) {
        if (i + 1 < lastrow.children.length && c.getElementsByClassName('wallRight').length > 0) {
          addStones(c, '#stonesBottomGapLR', 0, 56);
        } else {
          addStones(c, '#stonesBottomGapL', 0, 56);
        }
      } else if (i + 1 < lastrow.children.length && c.getElementsByClassName('wallRight').length > 0) {
        addStones(c, '#stonesBottomGapR', 0, 56);
      } else
        addStones(c, '#stonesBottom', 0, 56);
    });
  }
};