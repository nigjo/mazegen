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

const LOGGER = 'SETTINGS';
const SVGNS = 'http://www.w3.org/2000/svg';

async function fetchSvg(uri) {
  return fetch(uri)
          .then(r => r.text())
          .then(t => t
                    .replace(/>\s*/gs, '>')
                    .replace(/\s*</gs, '<'))
          .then(t => new DOMParser().parseFromString(t, "image/svg+xml"));
}


fetchSvg('assets/playerB.svg').then(svg => {
  const target = document.createElementNS(SVGNS, 'svg');
  target.setAttribute('viewBox', '0 0 8 16');
  target.setAttribute('width', 128);
  target.setAttribute('height', 256);
  const defs = document.createElementNS(SVGNS, 'defs');
  target.append(defs);
  //let symbols = {};
  let styles;
  for (const n of svg.querySelectorAll('defs>[id]')) {
    if (n.nodeName === 'symbol') {
      defs.append(n.cloneNode(true));
    } else if (n.nodeName === 'style') {
      if (!styles) {
        styles = document.createElementNS(SVGNS, 'style');
        defs.append(styles);
      }
      styles.append(n.textContent.replace(/\s*([{}:;])\s*/g, '$1'));
    }
  }
  let top = document.createElementNS(SVGNS, 'use');
  top.setAttribute('class', 'playerView');
  top.setAttribute('href', '#playerB-suedM');
  target.append(top);
  let bottom = document.createElementNS(SVGNS, 'use');
  top.setAttribute('class', 'playerView');
  bottom.setAttribute('href', '#playerB-rechtsM');
  bottom.setAttribute('transform', 'translate(0,8)');
  target.append(bottom);

  console.debug(LOGGER, target);
  document.getElementById('playerView')
          .replaceChildren(target);
  //console.debug(LOGGER, styles);
  //let defs = [...].reduce((a, v) => ({...a, [v.id]: v}), {});
  //let d = 

});

function initColorEditor() {
  console.debug(LOGGER, 'init editor');
  let colors = document.querySelectorAll('#player .colors input[type="color"]');
  for (let c of colors) {
    c.onchange = e => {
      console.debug(LOGGER, e.target.value, e.target.name);
      let svg = document.querySelector('#player svg');
      let colname = e.target.name;
      svg.style.setProperty('--' + colname, e.target.value);
    };
  }
}
if (document.readyState !== 'loaded') {
  document.addEventListener('DOMContentLoaded', initColorEditor);
} else {
  initColorEditor();
}