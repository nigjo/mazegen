import SVGGenerator from './m_svgview.js';
const svgDefs = await
Promise.all([
  fetch('res/isometric.svg').then(r => {
    if (r.ok) {
      return r.text();
    }
    throw r;
  }).then(str => {
    return new DOMParser().parseFromString(str, "image/svg+xml");
  }),
  fetch('res/isometric.css').then(r => {
    if (r.ok) {
      return r.text();
    }
    throw r;
  })
]).then((files) => {
  let svg, css;
  [svg, css] = files;
  let defs = [...svg.querySelectorAll('defs>[id]')];
  let styles = document.createElementNS(SVGGenerator.SVGNS, 'style');
  styles.setAttribute('id','isostyles');
  styles.textContent = css;
  defs.push(styles);
  //console.debug('defs', defs);
  return new Map(defs.map(e => [e.id, e]));
});

export default class IsometricView extends SVGGenerator {
  constructor(maze) {
    super(maze);

    this.scaleX = 1.;
    this.scaleY = .9;

    let hyp = Math.sqrt(this.cellHeight * this.cellHeight
            + this.cellWidth * this.cellWidth);
    //console.log(hyp);

    let diag = (maze.width + this.maze.height + 1) / 2;
    //console.log(diag);
    let walldisp = Math.sqrt(this.wallHeight * this.wallHeight
            + this.wallHeight * this.wallHeight);
    //console.debug(walldisp);

    this.canvasWidth = hyp * diag * this.scaleX;
    this.canvasHeight = (hyp * diag + walldisp) * this.scaleY;
    //console.debug(this.canvasHeight);

    this.offsetX = this.canvasWidth / 2;
    this.offsetY = this.canvasHeight / 2 + (walldisp / 2 * this.scaleY);
  }

  updateCanvasSize() {
  }

  initOutput(svg) {

    let defs = document.createElementNS(IsometricView.SVGNS, 'defs');
    for (let def of svgDefs.values()) {
      defs.append(def.cloneNode(true));
    }
    svg.append(defs);

    //<link xmlns="http://www.w3.org/1999/xhtml" rel="stylesheet" href="isometric.css" type="text/css"/>
    let css = document.createElementNS("http://www.w3.org/1999/xhtml", 'link');
    css.setAttribute('rel', 'stylesheet');
    css.setAttribute('href', 'res/isometric.css');
    css.setAttribute('type', 'text/css');
    css.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    //svg.append(css);

    //<rect stroke="green" fill="#EEFFEE" x="0" y="0" width="480" height="480"/>
    let bg = document.createElementNS(IsometricView.SVGNS, 'rect');
    bg.setAttribute('stroke', 'green');
    bg.setAttribute('fill', '#EEFFEE');
    bg.setAttribute('x', '0');
    bg.setAttribute('y', '0');
    bg.setAttribute('width', this.canvasWidth);
    bg.setAttribute('height', this.canvasHeight);
    svg.append(bg);
  }

  tile(tile, cell) {
    if (tile === 'boden') {
      return '#boden';
    } else if (tile.startsWith('door') || tile.startsWith('wall')) {
      if (tile.endsWith('Top') && cell.row > 0) {
        return;
      }
      if (tile.endsWith('Left') && cell.col > 0) {
        return;
      }
      return '#' + tile;
    }
    return;
  }

  create() {
    let svg = super.create();

    let centerY = ((this.maze.height - 1) / 2) * this.cellHeight;
    let centerX = ((this.maze.width - 1) / 2) * this.cellWidth;

    let m = svg.querySelector('.maze');
    m.setAttribute('transform', ''
            //+ ' translate(' + (this.canvasWidth / 2) + ',' + (this.canvasHeight / 2 + 20) + ')'
            + m.getAttribute('transform')
            + ' rotate(45)'
            + ' translate('
            + (-centerX) + ','
            + (-centerY) + ')'
            );

    return svg;
  }
}

if (window.mazedata) {
  import("./m_mazeinfo.js").then(mod => {
    let mazeinfo = mod.default;
    mazeinfo.registerView(1000, {
      displayName: "Isometrisch",
      generator: m => new IsometricView(m)
    });
  });
}