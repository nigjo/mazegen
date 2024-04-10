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
  }

  initOutput(svg) {
    let defs = document.createElementNS(TopDownView.SVGNS, 'defs');
    for (let def of svgDefs.values()) {
      defs.append(def.cloneNode(true));
    }
    svg.append(defs);
  }

  tile(tile, cell) {
    const puddles = [
      'puddle1', 'puddle2', 'puddle3', 'puddle4'
    ];
    if (svgDefs.has(tile)) {
      let classes = [tile];
      let items = [];
      let data = {};
      if (this.rnd(4) === 1) {
        switch (tile) {
          case 'boden':
          case 'decke':
          case 'doorLeft':
          case 'doorRight':
          case 'doorTop':
          case 'doorBottom':
            items = puddles;
            break;
          case 'wallTop':
            if (cell.row > 0) {
              items = ['boot', 'boot-1'];
            }
            break;
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
      } else if (tile.getAttribute('class') === 'wallTop') {
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
        let u = document.createElementNS(SVGGenerator.SVGNS, 'use');
        let item = tile.getAttribute('data-item');
        console.debug(row, cell, tile, item.substring(0, item.length - 2));
        tile.removeAttribute('data-item');
        u.setAttribute('href', '#' + item);
        u.setAttribute('transform', 'translate(' + (offset) + ',-22) scale(1.5,1.5)');
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

