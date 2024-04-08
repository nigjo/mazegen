import SVGGenerator from './m_svgview.js';
//
// 
const svgDefs = await fetch('res/v_topdown.svg').then(r => {
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

export default class TopDownView extends SVGGenerator {
  constructor(m) {
    super(m);
    this.offsetX = 0;
    this.offsetY = 0;
    this.scaleSvg = 1.5;
    this.rnd = m.constructor.randomGenerator(m.seed);
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
      let data = {};
      if (this.rnd(4) === 1) {
        const items = [
          'puddle1', 'puddle2', 'puddle3', 'puddle4'
        ];
        data.item = items[this.rnd(items.length)];
        //console.debug('TD', cell.col, cell.row, tile, data.item);
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
    let svg = super.create();
    let items = svg.querySelectorAll('[data-item]');
    items.forEach(tile => {
      //console.debug('TD', tile);
      if (!tile.getAttribute('class').startsWith('wall')) {
        let u = document.createElementNS(SVGGenerator.SVGNS, 'use');
        let item = tile.getAttribute('data-item');
        tile.removeAttribute('data-item');
        u.setAttribute('href', '#' + item);
        switch (tile.getAttribute('class')) {
          case 'decke':
            u.setAttribute('transform', 'translate(25,20)');
            break;
          case 'boden':
            u.setAttribute('transform', 'translate(40,38)');
            break;
          case 'doorLeft':
            u.setAttribute('transform', 'translate(12,35)');
            break;
          case 'doorRight':
            u.setAttribute('transform', 'translate(56,22)');
            break;
          case 'doorTop':
            u.setAttribute('transform', 'translate(39,4)');
            break;
          case 'doorBottom':
            u.setAttribute('transform', 'translate(24,48)');
            break;
        }
        tile.parentNode.insertBefore(u, tile.nextSibling);
      }
      //console.debug('TD', cell.col, cell.row, tile, data.item);
    });
    return svg;
  }
}

if (window.mazedata) {
  import("./m_mazeinfo.js").then(mod => {
    let mazeinfo = mod.default;
    mazeinfo.registerView(5000, m => new TopDownView(m));
  });
}

