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

let userSettings = {
  width: 6,
  height: 10
};
function reloadSettings() {
  let stored = localStorage.getItem("docksrunner.settings");
  if (stored) {
    userSettings = JSON.parse(stored);
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
  }
};

const settings = new Proxy(userSettings, {
  set: (target, prop, value) => {
    console.log('setting', prop);
    target[prop] = value;
    return value;
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
