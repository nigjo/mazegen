import SVGGenerator from './m_svgview.js';
//
// 
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
}).then(str => {
  return new DOMParser().parseFromString(str, "image/svg+xml");
}).then(svg => {
  let defs = [...svg.querySelectorAll('defs>[id]')];
  //console.debug('defs', defs);
  return new Map(defs.map(e => [e.id, e]));
});

const assets = {};
await assetFetcher.then(list => {
  //console.debug(list, svgDefs);
  let assetFetcher = [];
  for (let name of list) {
    assetFetcher.push(
    import('../assets/' + name + '.js').then(mod => {
      return mod.asset;
    }).then(a => {
      if ("view" in a) {
        console.log("loading", a.view);
        return fetch('assets/' + a.view)
                .then(r => r.text())
                .then(t => new DOMParser().parseFromString(t, "image/svg+xml"))
                .then(svg => {
                  a.tileMap = new Map();
                  [...svg.querySelectorAll('defs>[id]')].forEach(def => {
                    svgDefs.set(def.id, def);
                    if (def.tagName === 'g')
                      assets[def.id] = a;
                  });
                  return a;
                });

      }
      return a;
    }));
  }
  return Promise.all(assetFetcher);
});

export default class TopDownView extends SVGGenerator {
  constructor(m) {
    super(m);
    this.offsetX = 0;
    this.offsetY = 0;
    this.scaleSvg = 1.5;
    //console.debug([...svgDefs.keys()].join(','));
    this.defCount = svgDefs.size;
    this.assetCount = Object.keys(assets).length;
    //console.debug("asset IDs:",[...Object.keys(assets)].join(','));
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
      if (this.rnd(4) === 1) {
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
      return {
        tile: '#' + tile,
        className: classes.join(' '),
        data: data
      };
    }
    return;
  }

  create() {
    this.rnd = this.maze.constructor.randomGenerator(this.maze.seed);

    let svg = super.create();
    let items = svg.querySelectorAll('[data-item]');
    items.forEach(tile => {
      //console.debug('TD', tile);
      let item = tile.getAttribute('data-item');
      let tileName = tile.getAttribute('class');
      console.debug(tile, item, tileName);
      if (item in assets && tileName in assets[item].tiles) {
        let u = document.createElementNS(SVGGenerator.SVGNS, 'use');
        tile.removeAttribute('data-item');
        u.setAttribute('href', '#' + item);
        let transform = assets[item].tiles[tileName].transform;
        if (typeof (transform) === 'function') {
          u.setAttribute('transform', transform(tile));
        }
        tile.parentNode.insertBefore(u, tile.nextSibling);
      }

//      if (!tile.getAttribute('class').startsWith('wall')) {
//        let u = document.createElementNS(SVGGenerator.SVGNS, 'use');
//        tile.removeAttribute('data-item');
//        u.setAttribute('href', '#' + item);



//        switch (tile.getAttribute('class')) {
//          case 'decke':
//            u.setAttribute('transform', 'translate(25,20)');
//            break;
//          case 'boden':
//            u.setAttribute('transform', 'translate(40,38)');
//            break;
//          case 'doorLeft':
//            u.setAttribute('transform', 'translate(12,35)');
//            break;
//          case 'doorRight':
//            u.setAttribute('transform', 'translate(56,22)');
//            break;
//          case 'doorTop':
//            u.setAttribute('transform', 'translate(39,4)');
//            break;
//          case 'doorBottom':
//            u.setAttribute('transform', 'translate(24,48)');
//            break;
//        }
//        tile.parentNode.insertBefore(u, tile.nextSibling);
//      } else if (tile.getAttribute('class') === 'wallTop') {
      //boot-asset
//        let cell = tile.parentNode;
//        let row = cell.parentNode;
//        let offset = 10;
//        if (cell.previousElementSibling
//                && cell.previousElementSibling.querySelector('.doorTop')) {
//          offset -= 24;
//        } else if (cell.nextElementSibling
//                && cell.nextElementSibling.querySelector('.doorTop')) {
//          offset += 14;
//        }
//        let u = document.createElementNS(SVGGenerator.SVGNS, 'use');
//        let item = tile.getAttribute('data-item');
//        console.debug(row, cell, tile, item.substring(0, item.length - 2));
//        tile.removeAttribute('data-item');
//        u.setAttribute('href', '#' + item);
//        u.setAttribute('transform', 'translate(' + (offset) + ',-22) scale(1.5,1.5)');
//        tile.parentNode.insertBefore(u, tile.nextSibling);
      //}
      //console.debug('TD', cell.col, cell.row, tile, data.item);
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

