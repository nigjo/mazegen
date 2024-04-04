import Maze from './m_maze.js';

export default class SVGGenerator {

  static SVGNS = 'http://www.w3.org/2000/svg';

  /**
   * 
   * @param {Maze} maze Daten
   * @returns {SVGGenerator}
   */
  constructor(maze) {
    this.maze = maze;
    this.cellWidth = 64;
    this.cellHeight = 64;
    this.wallHeight = 32;

    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.scaleSvg = 0.75;

    this.offsetX = this.cellWidth / 2;
    this.offsetY = this.cellHeight / 2;

    //initial size. may be modified by child class
    this.updateCanvasSize();
  }

  updateCanvasSize() {
    this.canvasWidth = this.cellWidth * this.maze.width + 2 * this.offsetX;
    this.canvasHeight = this.cellHeight * this.maze.height + 2 * this.offsetY;
  }

  tile(tile, cell) {
    return '#' + tile;
  }

  initOutput(svg) {
  }

  create() {
    //calcuate actual size.
    this.updateCanvasSize();

    //<svg width="640" height="640" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
    let svg = document.createElementNS(SVGGenerator.SVGNS, 'svg');
    svg.setAttribute('width', Math.floor(this.canvasWidth * this.scaleSvg));
    svg.setAttribute('height', Math.floor(this.canvasHeight * this.scaleSvg));
    svg.setAttribute('viewBox', "0 0 " + this.canvasWidth + " " + this.canvasHeight);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid');
    svg.setAttribute('xmlns', SVGGenerator.SVGNS);

    this.initOutput(svg);

    //<g id="labyrith" transform="translate(240,260) scale(1,.9) rotate(45)">
    //20=cellHeight/16*5;
    let labyrith = document.createElementNS(SVGGenerator.SVGNS, 'g');
    labyrith.setAttribute('class', 'maze');
    if (this.offsetX > 0) {
      if (this.scaleX !== 1 || this.scaleY !== 1) {
        labyrith.setAttribute('transform',
                'translate(' + this.offsetX + ',' + this.offsetY + ')'
                + ' scale(' + this.scaleX + ',' + this.scaleY + ')'
                );
      } else {
        labyrith.setAttribute('transform',
                'translate(' + this.offsetX + ',' + this.offsetY + ')'
                );
      }
    } else if (this.scaleX !== 1 || this.scaleY !== 1) {
      labyrith.setAttribute('transform',
              ' scale(' + this.scaleX + ',' + this.scaleY + ')'
              );

    }
    let addTile = (parent, tile, cell) => {
      let link = this.tile(tile, cell);
      if (link) {
        let u = document.createElementNS(SVGGenerator.SVGNS, 'use');
        u.setAttribute('href', link);
        parent.append(u);
      }
    };
    for (let row = 0; row < this.maze.height; row++) {
      //<g transform="translate(0,-128)">
      let rowGroup = document.createElementNS(SVGGenerator.SVGNS, 'g');
      rowGroup.setAttribute('transform', 'translate(0,'
              + (row * this.cellHeight) + ')');
      for (let col = 0; col < this.maze.width; col++) {
        //<g transform="translate(-128,0)">
        let colGroup = document.createElementNS(SVGGenerator.SVGNS, 'g');
        colGroup.setAttribute('transform', 'translate('
                + (col * this.cellWidth) + ',0)');
        let cell = this.maze.cells[row][col];

        //<use href="isometric.svg#boden"/>
        addTile(colGroup, 'boden', cell);
        //<text text-anchor="middle">(1,1)</text>
        let loc = document.createElementNS(SVGGenerator.SVGNS, 'text');
        loc.setAttribute('text-anchor', 'middle');
        loc.textContent = '(' + (col + 1) + ',' + (row + 1) + ')';
        //colGroup.append(loc);

        if (cell.walls & Maze.NORTH) {
          addTile(colGroup, 'wallTop', cell);
        } else {
          addTile(colGroup, 'doorTop', cell);
        }
        if (cell.walls & Maze.WEST) {
          addTile(colGroup, 'wallLeft', cell);
        } else {
          addTile(colGroup, 'doorLeft', cell);
        }
        if (cell.walls & Maze.SOUTH) {
          addTile(colGroup, 'wallBottom', cell);
        } else {
          addTile(colGroup, 'doorBottom', cell);
        }
        if (cell.walls & Maze.EAST) {
          addTile(colGroup, 'wallRight', cell);
        } else {
          addTile(colGroup, 'doorRight', cell);
        }

        addTile(colGroup, 'decke', cell);

        rowGroup.append(colGroup);
      }
      labyrith.append(rowGroup);
    }

    svg.append(labyrith);

    //this.addDebugCross(svg);

    return svg;
  }

  addDebugCross(svg) {
    let dbgCross = document.createElementNS(SVGGenerator.SVGNS, 'g');
    dbgCross.style.setProperty('stroke', 'red');
    let line;
    line = document.createElementNS(SVGGenerator.SVGNS, 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', this.canvasWidth);
    line.setAttribute('y2', this.canvasHeight);
    dbgCross.append(line);
    line = document.createElementNS(SVGGenerator.SVGNS, 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', this.canvasHeight);
    line.setAttribute('x2', this.canvasWidth);
    line.setAttribute('y2', 0);
    dbgCross.append(line);
    line = document.createElementNS(SVGGenerator.SVGNS, 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', this.canvasHeight / 2);
    line.setAttribute('x2', this.canvasWidth);
    line.setAttribute('y2', this.canvasHeight / 2);
    dbgCross.append(line);
    line = document.createElementNS(SVGNS, 'line');
    line.setAttribute('x1', this.canvasWidth / 2);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', this.canvasWidth / 2);
    line.setAttribute('y2', this.canvasHeight);
    dbgCross.append(line);
    svg.append(dbgCross);
  }
}

