import SVGGenerator from './m_svgview.js';

const svgDefs = await fetch('res/v_topdown.svg').then(r => {
  if (r.ok) {
    return r.text();
  }
  throw r;
}).then(str => {
  return new DOMParser().parseFromString(str, "image/svg+xml");
}).then(svg => {
  let defs = [...svg.querySelectorAll('defs>[id]')];
  console.debug('defs', defs);
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
    let style = document.createElementNS(TopDownView.SVGNS, 'style');
    style.textContent = `
       svg{--waybg-col:green;}
       .boden{fill:url(#water);stroke:none;}
       .waterbg{fill:blue;}
       .waterwaves{fill:none;stroke:rgba(255,255,255,.15);stroke-width:2;}
       .bodenc{fill:blue;stroke:none;}
       .way{fill:url(#tiles);stroke:none;}
       .waybg{fill:peru;stroke:none;}
       .waytile{fill:rgba(255,255,255,.05);}
       .wallbg{fill:Sienna;stroke:none;}
       .wall{fill:url(#bricks);}
       .walldarkline{stroke:rgba(0,0,0,.2);stroke-width:1}
       .walldark{fill:rgba(0,0,0,.1);stroke:none;}
    `;
    svg.append(style);

    let defs = document.createElementNS(TopDownView.SVGNS, 'defs');
    for (let def of svgDefs.values()) {
      defs.append(def.cloneNode(true));
    }
    svg.append(defs);
  }

  tile(tile) {
    if (svgDefs.has(tile))
      return '#' + tile;
    return;
  }
}

if (window.mazedata) {
  import("./m_mazeinfo.js").then(mod => {
    let mazeinfo = mod.default;
    mazeinfo.registerView(3100, m => new TopDownView(m));
  });
}

