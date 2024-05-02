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
export const asset = {
  view: 'boat.svg',
  id: 'boot',
  width: 32,
  height: 32,
  tiles: {
    wallTop: {
      ids: ['boot'],
      validator: (cell) => {
        if (cell.row > 0) {
          let oben = cell.parent.getNeighbour(cell, cell.parent.constructor.NORTH);
          let obenItem = oben.topdownTile.wallTop?.data.item;
          //console.debug('BOAT', cell, obenItem);
          if (obenItem && obenItem.startsWith('boot'))
            return false;
          if (cell.col > 0) {
            let links = cell.parent.getNeighbour(cell, cell.parent.constructor.WEST);
            let linksItem = links.topdownTile.wallTop?.data.item;
            //console.debug('BOAT', cell, linksItem);
            if (linksItem && linksItem.startsWith('boot'))
              return false;
          }
          return true;
        }
        return false;
      },
      transform: modifySvgPlacement
    }
  },
  active: true
};

function modifySvgPlacement(tile) {
  let cell = tile.parentNode;
  let row = cell.parentNode;
  let offset = 10;
  if (cell.previousElementSibling
          && cell.previousElementSibling.querySelector('.doorTop')) {
    offset -= 24;
  } else if (cell.nextElementSibling
          && cell.nextElementSibling.querySelector('.doorTop')) {
    offset += 14;
  }
  return 'translate(' + (offset) + ',-22) scale(1.5,1.5)';
}