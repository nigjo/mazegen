export const asset = {
  view: 'banner.svg',
  tiles: {
    doorTop: {validator:()=>false,transform:()=>"translate(20,2)"},
    doorBottom: {validator:()=>false,transform:()=>"translate(20,46)"}
  },
  tail: (svg, maze) => {
    maze.entrance.topdownTile.doorTop.data.item = 'bannersExit';
    let mazeRowX = svg.querySelector('.maze>g:nth-child(' + (maze.entrance.row + 1) + ')');
    let mazeColX = mazeRowX.querySelector('g:nth-child(' + (maze.entrance.col + 1) + ')');
    let doorX = mazeColX.querySelector('use.doorTop');
    doorX.setAttribute('data-item', 'bannersExit');
    //console.debug('BANNER', doorX);
    maze.exit.topdownTile.doorBottom.data.item = 'bannersStart';
    let mazeRowS = svg.querySelector('.maze>g:nth-child(' + (maze.exit.row + 1) + ')');
    let mazeColS = mazeRowS.querySelector('g:nth-child(' + (maze.exit.col + 1) + ')');
    let doorS = mazeColS.querySelector('use.doorBottom');
    doorS.setAttribute('data-item', 'bannersStart');
  }

};