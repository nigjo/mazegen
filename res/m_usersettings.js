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

//only settings defined here are allowed
const defaultSettings = {
  width: 6,
  height: 10,
  locale: null,
  mode: 'default'
};
let userSettings = {...defaultSettings};
function reloadSettings() {
  const stored = localStorage.getItem("docksrunner.settings");
  if (stored) {
    const storedData = JSON.parse(stored);
    for (const p in defaultSettings)
      userSettings[p] = (p in storedData ? storedData : defaultSettings)[p];
  } else {
    //store defaults. should happen only once.
    localStorage.setItem("docksrunner.settings", JSON.stringify(userSettings));
  }
}
reloadSettings();

window.addEventListener('message', (e) => {
  if (typeof (e.data) !== 'string' || !e.data.startsWith('docksrunner.settings.')) {
    return;
  }
  switch (e.data) {
    case 'docksrunner.settings.stored':
      reloadSettings();
      break;
  }
});

const settingsManager = {
  store: () => {
    localStorage.setItem("docksrunner.settings", JSON.stringify(userSettings));
    postMessage('docksrunner.settings.stored', "*");
  },
  reset: (full) => {
    if (full) {
      //rewrite userSettings from defaults
      userSettings = {...defaultSettings};
    } else {
      //just reload stored values
      reloadSettings();
    }
  }
};

const settings = new Proxy(userSettings, {
  set: (target, prop, value) => {
    if (prop in target) {
      console.log('setting', prop);
      target[prop] = value;
      return value;
    }
  },
  get: (target, prop, receiver) => {
    if (prop in settingsManager) {
      return function (...args) {
        return settingsManager[prop].apply(this === receiver ? settingsManager : this, args);
      };
    }
    return target[prop];
  }
});

export default settings;
