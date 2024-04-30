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
const LOGGER = 'ROPESNPILES';
export const asset = {
  view: 'ropesAndPiles.svg',
  tiles: {
    wallTop: {validator: () => false},
    doorTop: {validator: () => false},
    wallLeft: {validator: () => false},
    doorLeft: {validator: () => false},
    wallRight: {validator: () => false},
    doorRight: {validator: () => false},
    wallBottom: {validator: () => false},
    doorBottom: {validator: () => false}
  },
  tail: (svg, maze, rng) => {
    //console.log(LOGGER,svg.outerHTML);
    function addRope(parent, type, x, y) {
      let u;
      u = document.createElementNS(svg.namespaceURI, 'use');
      u.setAttribute('href', '#rope' + type);
      u.setAttribute('transform', 'translate(' + x + ',' + y + ')');
      parent.insertAdjacentElement('afterend', u);
    }
    function addPilon(parent, x, y, shadow) {
      let u;
      if (shadow !== false) {
        u = document.createElementNS(svg.namespaceURI, 'use');
        u.setAttribute('href', '#pilonShadow');
        let offset = typeof (shadow) === 'number' ? shadow : 0;
        u.setAttribute('transform', 'translate(' + (x - offset) + ',' + (y + offset) + ')');
        parent.insertAdjacentElement('afterend', u);
      }
      u = document.createElementNS(svg.namespaceURI, 'use');
      u.setAttribute('href', '#pilon');
      u.setAttribute('transform', 'translate(' + x + ',' + y + ')');
      parent.insertAdjacentElement('afterend', u);
    }
    for (const k of Object.keys(asset.tiles)) {
      //console.log(LOGGER, k);
      const names = svg.getElementsByClassName(k);
      for (const tile of names) {
        switch (k) {
          case 'doorTop':
            addRope(tile, 'VT', 18, 0);
            addRope(tile, 'VT', 46, 0);
            break;
          case 'wallTop':
            addRope(tile, 'H', 18, 11);
            break;
          case 'doorLeft':
            addPilon(tile, 18, 14, false);
            addRope(tile, 'HL', 18, 11);
            addRope(tile, 'HL', 18, 39);
            break;
          case 'wallLeft':
            addRope(tile, 'V', 18, 12);
            addPilon(tile, 18, 14, 8);
            break;
          case 'doorRight':
            addPilon(tile, 46, 14, true);
            addRope(tile, 'HR', 46, 11);
            addRope(tile, 'HR', 46, 39);
            break;
          case 'wallRight':
            addRope(tile, 'V', 46, 12);
            addPilon(tile, 46, 14, true);
            break;
          case 'doorBottom':
            addRope(tile, 'VB', 18, 40);
            addRope(tile, 'VB', 46, 40);
            addPilon(tile, 18, 42, 8);
            addPilon(tile, 46, 42, true);
            break;
          case 'wallBottom':
            addPilon(tile, 18, 42, 8);
            addPilon(tile, 46, 42, true);
            addRope(tile, 'H', 18, 39);
            break;
        }
      }
    }
  }
};
