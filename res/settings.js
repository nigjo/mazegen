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

function setError(message) {
  let formdata = document.forms.settings;
  formdata.customsize.setCustomValidity(message);
  console.warn(LOGGER, message);
  settings.reset();
  formdata.customsize.reportValidity();
}

function saveData() {
  let formdata = document.forms.settings;
  console.debug(LOGGER, formdata);

  let sizeValue = formdata.gamesize.value;
  if (sizeValue === 'custom') {
    sizeValue = formdata.customsize.value;
  }
  let size = sizeValue.match(/^\s*(\d+)\s*[xX]\s*(\d+)\s*$/);
  console.warn(LOGGER, sizeValue, size);
  if (!size) {
    setError("invalid size value");
    return;
  } else {
    let w = Number(size[1]);
    let h = Number(size[2]);
    if (w > 50 || h > 50) {
      setError("exceeded max size");
      return;
    }
    if (w < 2 || h < 2) {
      setError("invalid minimal size value");
      return;
    }
    console.debug(LOGGER, w, h);
    settings.width = w;
    settings.height = h;
  }
  
  settings.mode = formdata.gamemode.value;
  
  settings.store();
  window.location = './index.html';
}

function initButtons() {
  document.getElementById('btnBack').onclick = () => {
    window.location = './index.html';
  };
  document.getElementById('btnSave').onclick = saveData;

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

  let mode = settings.mode;
  formdata.gamemode.value = mode;
  if (formdata.gamemode.value !== mode) {
    formdata.gamemode.value = 'timing';
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