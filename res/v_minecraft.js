import SVGGenerator from './m_svgview.js';

export default class MincraftView extends SVGGenerator {
  constructor(maze) {
    super(maze);
    this.allSides = true;
  }

  initOutput(svg) {
    let style = document.createElementNS(MincraftView.SVGNS, 'style');
    style.textContent = `
       .boden{fill:Sienna;stroke:SaddleBrown;}
       rect.wand{fill:green;stroke:none;}
       path.wand{fill:none;stroke:darkgreen;}
    `;
    svg.append(style);
  }

  tile(tile) {
    return 'res/minecraft.svg#' + tile;
  }
}

if (window.mazedata) {
  import("./m_mazeinfo.js").then(mod => {
    let mazeinfo = mod.default;
    mazeinfo.registerView(4000, m => new MincraftView(m));
  });
}
