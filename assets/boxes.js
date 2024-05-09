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
class CollectableBoxes {
  #LM;
  constructor() {
    this.view = 'boxes.svg';
    this.tiles = {};
    import('../res/m_lang.js').then(m => this.#LM = m.default);
  }
  lang() {
    return this.#LM?.message(...arguments) || arguments[0];
  }
  tail(s, m, r) {
    console.debug('BOXES', 'this', this);
    //console.debug('BOXES', this, asset.ids);
    this.fullBoxes = this.ids.filter(i => i !== 'boxes1');
    console.debug('BOXES', this.ids, this.fullBoxes);
    const view = s.querySelector('.maze');
    const north = m.constructor.NORTH;
    const south = m.constructor.SOUTH;
    const east = m.constructor.EAST;
    const west = m.constructor.WEST;
    const all = north + east + south + west;
    const deadends = [];
    for (let row of m.cells) {
      for (let cell of row) {
        if (cell.walls === all - north
                || cell.walls === all - south
                || cell.walls === all - east
                || cell.walls === all - west) {
          const c = view.children[cell.row].children[cell.col];
          deadends.push(c);
        }
      }
    }
    let counter = 3;
    while (deadends.length > 0 && counter-- > 0) {
      const cellIdx = r(deadends.length);
      const c = deadends.splice(cellIdx, 1);
      const typeIdx = r(this.fullBoxes.length);
      const off = r(3) * 4 - 4;
      //console.debug('BOXES', cell, c);
      //console.debug('BOXES', typeIdx, asset.fullBoxes[typeIdx]);
      if (c[0].querySelector('.doorBottom')) {
        this.#addBox(c[0], 28 + off, 14, this.fullBoxes[typeIdx]);
      } else
        this.#addBox(c[0], 28 + off, 32, this.fullBoxes[typeIdx]);
    }
    console.debug('BOXES', counter);
  }
  #addBox(cell, x, y, id) {
    const u = document.createElementNS(cell.namespaceURI, 'use');
    u.setAttribute('data-z', y + 4);
    u.setAttribute('href', '#' + id);
    u.setAttribute('class', 'collectable');
    //u.setAttribute('data-collected', 'boxes1');
    u.setAttribute('transform', 'translate(' + x + ',' + y + ')');
    cell.append(u);
    cell.addEventListener('docksrunner.collected', evt => {
      u.removeAttribute('class');
      u.setAttribute('href', '#boxes1');
      document.dispatchEvent(new CustomEvent('docksrunner.score.add', {
        detail: {
          score: 100,
          message: this.lang('boxes.collected',
                  this.lang('boxes.' + id.replace(/^boxes/, '')))
        }
      }));
    });
  }
}
;

export {CollectableBoxes as asset};