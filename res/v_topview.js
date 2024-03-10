import SVGGenerator from './m_svgview.js';

export default class TopView extends SVGGenerator {
  constructor(m) {
    super(m);

    this.allSides = true;
  }

  initOutput(svg) {
    let defs = document.createElementNS(SVGGenerator.SVGNS, 'defs');

    let boden = document.createElementNS(SVGGenerator.SVGNS, 'rect');
    boden.id = 'boden';
    boden.setAttribute('x', 0);
    boden.setAttribute('y', 0);
    boden.setAttribute('width', this.cellWidth);
    boden.setAttribute('height', this.cellHeight);
    boden.setAttribute('fill', 'silver');
    boden.setAttribute('stroke', 'dimgray');
    defs.append(boden);

    let wall = document.createElementNS(SVGGenerator.SVGNS, 'rect');
    wall.id = 'doorTop';
    wall.setAttribute('x', this.cellWidth / 4);
    wall.setAttribute('y', 0);
    wall.setAttribute('width', this.cellWidth / 2);
    wall.setAttribute('height', this.cellHeight * 3 / 4);
    wall.setAttribute('fill', 'dimgray');
    wall.setAttribute('stroke', 'none');
    defs.append(wall);

    wall = document.createElementNS(SVGGenerator.SVGNS, 'rect');
    wall.id = 'doorBottom';
    wall.setAttribute('x', this.cellWidth / 4);
    wall.setAttribute('y', this.cellHeight / 4);
    wall.setAttribute('width', this.cellWidth / 2);
    wall.setAttribute('height', this.cellHeight * 3 / 4);
    wall.setAttribute('fill', 'dimgray');
    wall.setAttribute('stroke', 'none');
    defs.append(wall);

    wall = document.createElementNS(SVGGenerator.SVGNS, 'rect');
    wall.id = 'doorLeft';
    wall.setAttribute('x', 0);
    wall.setAttribute('y', this.cellHeight / 4);
    wall.setAttribute('width', this.cellWidth * 3 / 4);
    wall.setAttribute('height', this.cellHeight /2);
    wall.setAttribute('fill', 'dimgray');
    wall.setAttribute('stroke', 'none');
    defs.append(wall);

    wall = document.createElementNS(SVGGenerator.SVGNS, 'rect');
    wall.id = 'doorRight';
    wall.setAttribute('x', this.cellWidth / 4);
    wall.setAttribute('y', this.cellHeight / 4);
    wall.setAttribute('width', this.cellWidth * 3 / 4);
    wall.setAttribute('height', this.cellHeight /2);
    wall.setAttribute('fill', 'dimgray');
    wall.setAttribute('stroke', 'none');
    defs.append(wall);

    svg.append(defs);

    let bg = document.createElementNS(SVGGenerator.SVGNS, 'rect');
    bg.setAttribute('stroke', 'green');
    bg.setAttribute('fill', '#EEFFEE');
    bg.setAttribute('x', '0');
    bg.setAttribute('y', '0');
    bg.setAttribute('width', this.canvasWidth);
    bg.setAttribute('height', this.canvasHeight);
    svg.append(bg);
  }
}
