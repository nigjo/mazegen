import Maze from './m_maze.js';
import defloader from './m_defloader.js';

const SVGNS = 'http://www.w3.org/2000/svg';

class Room {
  constructor(maze, cell) {
    this.maze = maze;
    this.cell = cell;
    this.doors = [];
  }
}

export default class GraphInfo {

  static viewProps = ['keepSingleDeadends', 'showPath', 'dungeon'];

  /**
   * @param {Maze} maze Irrgarten
   */
  constructor(maze) {
    /**@type {Maze} */
    this.maze = maze;
    this.showPath = true;
    this.keepSingleDeadends = true;
    this.dungeon = false;
  }

  create() {
    let content = document.createDocumentFragment();

    let graph = this.#createGraph();

    content.append(this.#createVisual(graph));

    let wrapper = document.createElement('div');
    wrapper.classList.add('maze');
    wrapper.classList.add('graph');
    wrapper.append(content);
    return wrapper;
  }

  #createGraph() {
    let mazeCells = new Map();
    let cells = [this.maze.entrance];
    const dirs = [Maze.NORTH, Maze.EAST, Maze.SOUTH, Maze.WEST];
    while (cells.length > 0) {
      let current = cells.shift();
      let knot = new Room(this.maze, current);
      mazeCells.set(current, knot);

      for (var dir of dirs) {
        let n = this.maze.getNeighbour(current, dir);
        //console.debug(current, dir, n);
        if (n && !this.maze.hasWall(current, n)) {
          knot.doors.push({
            direction: dir,
            neighbour: n,
            length: 1,
            next: n
          });
          if (!mazeCells.has(n)) {
            cells.push(n);
          }
        }
      }
    }

    return this.#reduceGraph(mazeCells);
  }

  #reduceGraph(mazeCells) {
    //reduce graph
    let graph = new Map();
    let rooms = [mazeCells.get(this.maze.entrance)];
    while (rooms.length > 0) {
      let currentRoom = rooms.shift();
      graph.set(currentRoom.cell, currentRoom);
      let doors = [...currentRoom.doors];
      while (doors.length > 0) {
        let door = doors.pop();
        let nextdoor = door;
        let lastdir = door.direction;
        while (nextdoor.neighbour !== this.maze.exit
                && nextdoor.neighbour !== this.maze.entrance
                && mazeCells.get(nextdoor.neighbour).doors.length === 2) {
          let selfdir = lastdir << 2;
          if (selfdir > 8)
            selfdir >>>= 4;
          let cInfo = mazeCells.get(nextdoor.neighbour);
          if (cInfo.doors[0].direction === selfdir) {
            nextdoor = cInfo.doors[1];
          } else {
            nextdoor = cInfo.doors[0];
          }
          lastdir = nextdoor.direction;
          door.next = nextdoor.next;
          ++door.length;
        }
        if (!graph.has(nextdoor.next)) {
          rooms.push(mazeCells.get(nextdoor.next));
        } else {
          let thisRoom = mazeCells.get(nextdoor.next);
          //let oldRoom = mazeCells.get(nextdoor.next);
          if (currentRoom.parentRoom) {
            throw "parentRoom already defined";
          }
          currentRoom.parentRoom = thisRoom;
        }
      }
    }

    if (!this.keepSingleDeadends) {
      [...graph.keys()].filter(k => {
        return graph.get(k).doors.length == 1
                && graph.get(k).doors[0].length == 1;
      }).forEach(k => {
        if (k == this.maze.entrance || k == this.maze.exit)
          return;
        let deadEnd = graph.get(k);
        //console.debug(deadEnd);
        deadEnd.parentRoom.doors =
                deadEnd.parentRoom.doors.filter(d => d.next != k)
        //graph.delete(k);
      });

    }

    return graph;
  }

  #createVisual(graph) {
    let svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid');
    svg.setAttribute('xmlns', SVGNS);
    if (this.dungeon) {
      svg.setAttribute('class', "dungeon");
    }

    let defs = document.createElementNS(SVGNS, 'defs');
    for (let def of svgDefs.values()) {
      defs.append(def.cloneNode(true));
    }
    svg.append(defs);


    this.#addVisualContent(svg, graph);

    let viewBox = svg.getAttribute('viewBox').split(' ');
    console.log(viewBox);
    let bg = document.createElementNS(SVGNS, 'rect');
    bg.setAttribute('class', 'bg');
    bg.setAttribute('x', viewBox[0]);
    bg.setAttribute('y', viewBox[1]);
    bg.setAttribute('width', viewBox[2]);
    bg.setAttribute('height', viewBox[3]);
    svg.insertBefore(bg, defs.nextElementSibling);

    return svg;
  }

  #addRoom(svg, roomDef, dotsize) {
    let room = document.createElementNS(SVGNS, 'use');
    room.setAttribute('href', '#room');
    room.setAttribute('transform',
            'translate(' + (roomDef.x) + ',' + roomDef.y + ')'
            + 'scale(' + (dotsize / 16) + ')');
    room.setAttribute('class', 'knot');
    svg.append(room);
  }

  #addVisualContent(svg, graph) {
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    const delta = 28;
    const dotsize = 13;
    const half = dotsize / 2 + 1;

    function updateCanvas(room) {
      minX = Math.min(minX, room.x - delta)
      maxX = Math.max(maxX, room.x + delta)
      minY = Math.min(minY, room.y - delta)
      maxY = Math.max(maxY, room.y + delta)
    }

    let queue = [];
    let firstRoom = graph.get(this.maze.entrance);
    firstRoom.x = delta + delta * firstRoom.cell.col;
    firstRoom.y = delta + delta * firstRoom.cell.row;

    let edges = new Map();

    queue.push(firstRoom);
    while (queue.length > 0) {
      let current = queue.shift();
      updateCanvas(current);

      for (let door of current.doors) {
        let nextRoom = graph.get(door.next);
        if (current.parentRoom == nextRoom) {
          let edge = document.createElementNS(SVGNS, 'line');
          edge.setAttribute('x1', current.x)
          edge.setAttribute('y1', current.y)
          edge.setAttribute('x2', nextRoom.x)
          edge.setAttribute('y2', nextRoom.y)
          edge.setAttribute('class', 'edge1');

          let tunnel = document.createElementNS(SVGNS, 'path');
          let tunnelPath = 'M' + current.x + ',' + current.y + 'C';
          switch (door.direction) {
            case Maze.NORTH:
              tunnelPath += current.x + "," + (current.y - delta);
              break;
            case Maze.SOUTH:
              tunnelPath += current.x + "," + (current.y + delta);
              break;
            case Maze.EAST:
              tunnelPath += (current.x + delta) + "," + current.y;
              break;
            case Maze.WEST:
              tunnelPath += (current.x - delta) + "," + current.y;
              break;
          }
          let targetDoor = current.parentRoom.doors.filter(d => d.next == current.cell);
          switch (targetDoor[0].direction) {
            case Maze.NORTH:
              tunnelPath += ',' + nextRoom.x + "," + (nextRoom.y - delta);
              break;
            case Maze.SOUTH:
              tunnelPath += ',' + nextRoom.x + "," + (nextRoom.y + delta);
              break;
            case Maze.EAST:
              tunnelPath += ',' + (nextRoom.x + delta) + "," + nextRoom.y;
              break;
            case Maze.WEST:
              tunnelPath += ',' + (nextRoom.x - delta) + "," + nextRoom.y;
              break;
          }

          tunnelPath += ',' + nextRoom.x + "," + nextRoom.y;
          tunnel.setAttribute('d', tunnelPath);

          tunnel.setAttribute('class', 'edge');
          svg.append(tunnel);

          edges.set(current, tunnel);

          continue;
        }

        nextRoom.x = delta + delta * nextRoom.cell.col;
        nextRoom.y = delta + delta * nextRoom.cell.row;

        queue.push(nextRoom);
      }
    }

    if (this.dungeon) {

      const addLine = (cell, toY) => {
        let entrance = document.createElementNS(SVGNS, 'line');
        entrance.setAttribute('x1', cell.x);
        entrance.setAttribute('y1', cell.y);
        entrance.setAttribute('x2', cell.x);
        entrance.setAttribute('y2', toY);
        if (this.showPath) {
          entrance.setAttribute('class', 'edge way');
        } else {
          entrance.setAttribute('class', 'edge');
        }
        svg.append(entrance);
        if (cell.doors.length > 1) {
          this.#addRoom(svg, cell, dotsize);
        }
      };
      let start = graph.get(this.maze.entrance);
      addLine(start, minY);

      let ende = graph.get(this.maze.exit);
      addLine(ende, maxY);

      [...graph.values()].forEach(current => {
        if (current.x && current.doors.length > 2) {
          this.#addRoom(svg, current, dotsize);
        }
      });
    }

    if (this.showPath) {
      let solution = graph.get(this.maze.exit);
      while (solution.cell != this.maze.entrance) {
        let tunnel = edges.get(solution);
        tunnel.setAttribute('class', tunnel.getAttribute('class') + " way")
        solution = solution.parentRoom;
      }
    }

    if (!this.dungeon) {
      for (let cell of [this.maze.entrance, this.maze.exit]) {
        let current = graph.get(cell);
        let room = document.createElementNS(SVGNS, 'rect');
        room.setAttribute('x', current.x - half);
        room.setAttribute('y', current.y - half);
        room.setAttribute('width', dotsize);
        room.setAttribute('height', dotsize);
        room.setAttribute('class', 'knot');
        svg.append(room);
      }
    } else if (this.showPath) {
      let ways = [...svg.querySelectorAll('.edge.way')]
      console.debug('PATH', ways);
      ways.forEach(w => svg.append(w));
    }

    let canvasWidth = Math.floor((maxX - minX + 2) * 100) / 100;
    let canvasHeight = Math.floor((maxY - minY + 2) * 100) / 100;
    svg.setAttribute('width', Math.floor(canvasWidth * 1));
    svg.setAttribute('height', Math.floor(canvasHeight * 1));
    svg.setAttribute('viewBox', (minX - 1) + " " + (minY - 1) + " "
            + canvasWidth + " " + canvasHeight);
  }
}

const svgDefs = await defloader('res/v_graph_defs.svg');

if (window.mazedata) {
  import("./m_mazeinfo.js").then(mod => {
    let mazeinfo = mod.default;
    mazeinfo.registerView(2004, {
      displayName: "Graph",
      generator: m => new GraphInfo(m)
    });
    mazeinfo.registerView(2014, {
      displayName: "Dungeon",
      generator: m => {
        let gi = new GraphInfo(m);
        gi.keepSingleDeadends = false;
        gi.showPath = false;
        gi.dungeon = true;
        return gi;
      }
    });
  });
}