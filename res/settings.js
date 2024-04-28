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

import settings from './m_usersettings.js';

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

function initButtons() {
  document.getElementById('btnBack').onclick = () => {
    window.location = './index.html';
  };
  document.getElementById('btnSave').onclick = () => {
    let formdata = document.forms.settings;
    console.debug(LOGGER, formdata);

    let sizeValue = formdata.gamesize.value;
    if (sizeValue === 'custom') {
      sizeValue = formdata.customsize.value;
    }
    let size = sizeValue.match(/^\s*(\d+)\s*[xX]\s*(\d+)\s*$/);
    console.warn(LOGGER, sizeValue, size);
    if (!size) {
      formdata.customsize.setCustomValidity("invalid size value");
      console.warn(LOGGER, "invalid size value");
      settings.reset();
      formdata.customsize.reportValidity();
      return;
    } else {
      let w = Number(size[1]);
      let h = Number(size[2]);
      if (w > 50 || h > 50) {
        formdata.customsize.setCustomValidity("invalid size value");
        console.warn(LOGGER, "invalid size value");
        settings.reset();
        formdata.customsize.reportValidity();
        return;
      }
      if (w < 2 || h < 2) {
        formdata.customsize.setCustomValidity("invalid size value");
        console.warn(LOGGER, "invalid size value");
        settings.reset();
        formdata.customsize.reportValidity();
        return;
      }
      console.debug(LOGGER, w, h);
      settings.width = w;
      settings.height = h;
    }

    settings.store();
    window.location = './index.html';
  };

  document.forms.settings.customsize.onchange = () => {
    document.forms.settings.gamesize.value = 'custom';
  };

  document.forms.settings.onsubmit = () => {
    document.getElementById('btnSave').click();
    return false;
  };
}

function initSettings() {
  let formdata = document.forms.settings;

  let sizeVal = settings.width + 'x' + settings.height;

  formdata.gamesize.value = sizeVal;
  if (formdata.gamesize.value !== sizeVal) {
    formdata.gamesize.value = 'custom';
    formdata.customsize.value = sizeVal;
  }

}


function initSettingsPage() {
  console.debug(LOGGER, 'init page');
  initButtons();
  initSettings();
}

if (document.readyState !== 'loaded') {
  console.debug(LOGGER, 'wait for init');
  document.addEventListener('DOMContentLoaded', initSettingsPage);
} else {
  console.debug(LOGGER, 'init page');
  initSettingsPage();
}