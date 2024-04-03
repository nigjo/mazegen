import SVGGenerator from './m_svgview.js';

export default class TopDownView extends SVGGenerator {
  constructor(m) {
    super(m);
    this.allSides = true;
  }

  initOutput(svg) {
    let style = document.createElementNS(TopDownView.SVGNS, 'style');
    style.textContent = `
       svg{--waybg-col:green;}
       .boden{fill:url(res/v_topdown.svg#water);stroke:none;}
       .bodenc{fill:blue;stroke:none;}
       .way{fill:url(res/v_topdown.svg#tiles);stroke:none;}
       .waybg{fill:peru;stroke:none;}
       .wally{fill:Sienna;stroke:none;}
       .wall{fill:url(res/v_topdown.svg#bricks);stroke:rgba(0,0,0,.2);stroke-width:1}
       .walldark{fill:rgba(0,0,0,.1);stroke:none;}
    `;
    svg.append(style);
    
    let viewBox = svg.getAttribute('viewBox').split(' ');
    svg.setAttribute('width', Number(viewBox[2])*1.5);
    svg.setAttribute('height', Number(viewBox[3])*1.5);
  }

  tile(tile) {
    return 'res/v_topdown.svg#' + tile;
  }
}

if (window.mazedata) {
  import("./m_mazeinfo.js").then(mod => {
    let mazeinfo = mod.default;
    mazeinfo.registerView(3100, m => new TopDownView(m));
  });
}

