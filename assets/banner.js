/* 
 * Copyright 2024 nigjo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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