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
import SVGGenerator from './m_svgview.js';
//
// 
const LOGGER = 'TOPDOWN';
const assetFetcher = fetch('assets/assets.json').then(r => {
  if (r.ok) {
    return r.json();
  }
  throw r;
});

async function fetchSvg(uri) {
  return fetch(uri)
          .then(r => r.text())
          .then(t => t
                    .replace(/>\s*/gs, '>')
                    .replace(/\s*</gs, '<'))
          .then(t => new DOMParser().parseFromString(t, "image/svg+xml"));
}

const svgDefs = new Map();
await
Promise.all([
  fetchSvg('res/v_topdown.svg'),
  fetchSvg('res/game_bg_water.svg'),
  fetchSvg('res/game_bg_way.svg'),
  fetchSvg('res/game_bg_wall.svg')
]).then(svgs => {
  const svg = svgs[0];
  let defs = [...svg.querySelectorAll('defs>[id]')];
  defs
          .filter(i => i.tagName === 'style')
          .forEach(s => s.textContent = String(s.textContent)
                    .replace(/^\s+/gm, '')
                    .replace(/\s+([}{;:])/gs, '$1')
                    .replace(/([}{;:])\s+/gs, '$1')
          );
  console.debug(LOGGER, 'basics', defs.map(e => [e.id, e]));
  defs.forEach(e => svgDefs.set(e.id, e));
  for (var i = 1, max = svgs.length; i < max; i++) {
    addDefinitions(svgs[i], 'topdownDefs');
  }
  return;
});

function addDefinitions(svg, styleTarget, cb) {
  const defs = [...svg.querySelectorAll('defs>[id]')];
  defs.forEach(def => {
    if (def.tagName === 'style') {
      let styles = svgDefs.get(styleTarget);
      if (!svgDefs.has(styleTarget)) {
        styles = document.createElementNS(SVGGenerator.SVGNS, 'style');
        styles.setAttribute('id', styleTarget);
        svgDefs.set(styleTarget, styles);
      }
      styles.append(String(def.textContent)
              .replace(/^\s+/gm, '')
              .replace(/\s+([}{;:])/gs, '$1')
              .replace(/([}{;:])\s+/gs, '$1')
              );
    } else {
      svgDefs.set(def.id, def);
    }
    if (typeof (cb) === 'function') {
      cb(def);
    }
  });
  console.debug(LOGGER, styleTarget, defs.map(d => d.id));
}


const assets = {};
await
assetFetcher.then(list => {
  //console.debug(LOGGER, list, svgDefs);
  let assetDefs = [];
  for (let name of list) {
    assetDefs.push(
    import('../assets/' + name).then(mod => {
      mod.asset.name = name;
      mod.asset.position = list.indexOf(name);
      return mod.asset;
    }).then(a => {
      if ("view" in a) {
        console.debug(LOGGER, "ASSETS", a.view, "loading...");
        return fetch('assets/' + a.view)
                .then(r => r.text())
                .then(t => t
                          .replace(/>\s*/gs, '>')
                          .replace(/\s*</gs, '<'))
                .then(t => [a, new DOMParser().parseFromString(t, "image/svg+xml")]);
      }
      return [a, null];
    }));
  }
  return Promise.all(assetDefs).then(assetList => {
    console.debug(LOGGER, 'ASSETS', assetList.map(i => i[0].position + '/' + i[0].name));
    let a, svg;
    for ([a, svg] of assetList) {
      //const add = svg => {
      addDefinitions(svg, 'asset_styles', (def) => {
        if (def.tagName === 'g' || def.tagName === 'symbol')
          assets[def.id] = a;
      });
      if ("init" in a) {
        a.init();
      }
    }
  });
});

export default class TopDownView extends SVGGenerator {
  constructor(m) {
    super(m);
    this.offsetX = 0;
    this.offsetY = 0;
    this.scaleSvg = 1.5;
    //console.debug(LOGGER, [...svgDefs.keys()].join(','));
    this.defCount = svgDefs.size;
    this.assetCount = Object.keys(assets).length;
    let players = Object.values(assets).filter(a => a.player);
    this.hasPlayer = players.length > 0;
    if (this.hasPlayer) {
      this.player = players[0];
      this.playerOffsetX = this.cellWidth / 2;
      this.playerOffsetY = this.cellHeight / 2 - 4;
    }

    //console.debug(LOGGER, "asset IDs:",[...Object.keys(assets)].join(','));
  }

  initOutput(svg) {
    let defs = document.createElementNS(TopDownView.SVGNS, 'defs');
    for (let def of svgDefs.values()) {
      defs.append(def.cloneNode(true));
    }
    svg.append(defs);
  }

  addRandomItems(tile, cell) {
    if (this.rnd(5) < 2) {
      let items = [];
      for (let id of Object.keys(assets)) {
        if ("tiles" in assets[id] && tile in assets[id].tiles) {
          if ("validator" in assets[id].tiles[tile]) {
            if (!assets[id].tiles[tile].validator(cell, id)) {
              continue;
            }
          }
          items.push(id);
        }
      }
      if (items.length > 0) {
        return items[this.rnd(items.length)];
      }
    }
  }

  tile(tile, cell) {
    if (svgDefs.has(tile)) {
      let classes = [tile, 'tile'];
      let data = {};

      let item = this.addRandomItems(tile, cell);
      if (item)
        data.item = item;

      cell.topdownTile = cell.topdownTile || {};
      cell.topdownTile[tile] = {
        tile: '#' + tile,
        className: classes.join(' '),
        data: data
      };
      return cell.topdownTile[tile];
    }
    return;
  }

  create() {
    this.rnd = this.maze.constructor.randomGenerator(this.maze.seed);

    //reset tile storage
    for (let r of this.maze.cells) {
      for (let c of r) {
        delete c.topdownTile;
      }
    }

    // reset all assets
    const knownAssetDefs = new Set();
    Object.values(assets).forEach(a => {
      if (!knownAssetDefs.has(a)) {
        //console.debug(LOGGER, 'reset', a.view);
        knownAssetDefs.add(a);
        if ("reset" in a) {
          a.reset(this.maze);
        }
      }
    });

    let svg = super.create();

    //console.debug(LOGGER, 'TAILS', knownAssetDefs);
    for (let a of knownAssetDefs) {
      if ("tail" in a) {
        a.tail(svg, this.maze, this.rnd);
      }
    }

    let items = svg.querySelectorAll('[data-item]');
    console.debug(LOGGER, items.length, 'items');
    items.forEach(tile => {
      //console.debug(LOGGER, 'TD', tile);
      let item = tile.getAttribute('data-item');
      let classes = tile.getAttribute('class').split(' ');
      let tileName = classes[0];
      //console.debug(LOGGER, tile, item, tileName);
      if (item in assets && tileName in assets[item].tiles) {
        let u = document.createElementNS(SVGGenerator.SVGNS, 'use');
        tile.removeAttribute('data-item');
        u.setAttribute('href', '#' + item);
        let transform = assets[item].tiles[tileName].transform;
        if (typeof (transform) === 'function') {
          u.setAttribute('transform', transform(tile, u));
        } else if (typeof (transform) === 'string') {
          u.setAttribute('transform', transform);
        }
        if (!u.hasAttribute('data-z')) {
          const move = u.getAttribute('transform').match(/translate\([-\.\d]+,([-\.\d]+)\)/)
          //console.debug(LOGGER, move, u.getAttribute('transform'));
          u.setAttribute('data-z', move[1]);
        }
        tile.parentNode.insertBefore(u, tile.nextElementSibling);
      } else {
        console.debug(LOGGER, item, 'not handled. Known?', item in assets);
      }
    });

    const m = svg.querySelector('.maze');
    let row = m.firstElementChild;
    while (row) {
      let cell = row.firstElementChild;
      while (cell) {
        let tileAssets = [...cell.getElementsByTagName('use')]
                .filter(u => u.hasAttribute('data-z'));
        tileAssets.sort((a1, a2) =>
          Number(a1.getAttribute('data-z'))
                  - Number(a2.getAttribute('data-z')));
        const decke = cell.querySelector('.decke');
        //reinsert before "decke"
        tileAssets.forEach(a => {
          a.removeAttribute('data-z');
          cell.insertBefore(a, decke);
        });

        cell = cell.nextElementSibling;
      }
      row = row.nextElementSibling;
    }

    return svg;
  }
}

