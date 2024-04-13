import SVGGenerator from './m_svgview.js';
import defloader from './m_defloader.js';

const svgDefs = await defloader('res/minecraft.svg');

export default class MincraftView extends SVGGenerator {
  constructor(maze) {
    super(maze);
    this.allSides = true;
  }

  initOutput(svg) {
    let defs = document.createElementNS(MincraftView.SVGNS, 'defs');
    for (let def of svgDefs.values()) {
      defs.append(def.cloneNode(true));
    }
    svg.append(defs);
    let style = document.createElementNS(MincraftView.SVGNS, 'style');
    style.textContent = `
       .boden{fill:Sienna;stroke:SaddleBrown;}
       rect.wand{fill:green;stroke:none;}
       path.wand{fill:none;stroke:darkgreen;}
    `;
    defs.append(style);
  }

  tile(tile) {
    if(!svgDefs.has(tile))
      return undefined;
    return '#' + tile;
  }
}

if (window.mazedata) {
  import("./m_mazeinfo.js").then(mod => {
    let mazeinfo = mod.default;
    mazeinfo.registerView(4000, m => new MincraftView(m));
  });
}
