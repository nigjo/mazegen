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

const svgDefs = await
fetch('res/v_topdown.svg').then(r => {
  if (r.ok) {
    return r.text();
  }
  throw r;
}).then(t => t
          .replace(/>\s*/gs, '>')
          .replace(/\s*</gs, '<')
).then(str => {
  return new DOMParser().parseFromString(str, "image/svg+xml");
}).then(svg => {
  let defs = [...svg.querySelectorAll('defs>[id]')];
  defs
          .filter(i => i.tagName === 'style')
          .forEach(s => s.textContent = String(s.textContent)
                    .replace(/^\s+/gm, '')
                    .replace(/\s+([}{;:])/gs, '$1')
                    .replace(/([}{;:])\s+/gs, '$1')
          );
  //console.debug(LOGGER, 'defs', defs);
  return new Map(defs.map(e => [e.id, e]));
});

const assets = {};
await assetFetcher.then(list => {
  //console.debug(LOGGER, list, svgDefs);
  let assetDefs = [];
  for (let name of list) {
    assetDefs.push(
    import('../assets/' + name ).then(mod => {
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
      const defs = [...svg.querySelectorAll('defs>[id]')];
      defs.forEach(def => {
        if (def.tagName === 'style') {
          let styles = svgDefs.get('asset_styles');
          if (!svgDefs.has('asset_styles')) {
            styles = document.createElementNS(SVGGenerator.SVGNS, 'style');
            styles.setAttribute('id', 'asset_styles');
            svgDefs.set('asset_styles', styles);
          }
          styles.append(String(def.textContent)
                  .replace(/^\s+/gm, '')
                  .replace(/\s+([}{;:])/gs, '$1')
                  .replace(/([}{;:])\s+/gs, '$1')
                  );
        } else {
          svgDefs.set(def.id, def);
        }
        if (def.tagName === 'g' || def.tagName === 'symbol')
          assets[def.id] = a;
      });
      if ("init" in a) {
        a.init();
      }
      console.debug(LOGGER, "asset", a.view, defs.map(d => d.id));
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

  tile(tile, cell) {
    if (svgDefs.has(tile)) {
      let classes = [tile];
      let items = [];
      let data = {};
      if (this.rnd(3) === 1) {
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
          data.item = items[this.rnd(items.length)];
        }
      }

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
      let tileName = tile.getAttribute('class');
      //console.debug(LOGGER, tile, item, tileName);
      if (item in assets && tileName in assets[item].tiles) {
        let u = document.createElementNS(SVGGenerator.SVGNS, 'use');
        tile.removeAttribute('data-item');
        u.setAttribute('href', '#' + item);
        let transform = assets[item].tiles[tileName].transform;
        if (typeof (transform) === 'function') {
          u.setAttribute('transform', transform(tile));
        }
        tile.parentNode.insertBefore(u, tile.nextSibling);
      } else {
        console.debug(LOGGER, 'failed', item in assets);
      }
    });
    return svg;
  }
}

if (window.mazedata) {
  import("./m_mazeinfo.js").then(mod => {
    let mazeinfo = mod.default;
    mazeinfo.registerView(5000, {
      displayName: 'Kaianlage',
      generator: m => new TopDownView(m)
    });
  });
}

