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
const LOGGER = 'LANG';
console.debug(LOGGER, 'initialize...');
const data = await
fetch('res/lang.json').then(r => r.json());

console.debug(LOGGER, 'loading...');
async function tryLanguages(languages) {
  const lang = languages.shift();
  console.debug(LOGGER, 'try', lang);
  await fetch('res/lang_' + lang + '.json')
          .then(r => r.json())
          .then(lngData => {
            console.debug(LOGGER, 'loaded', lang, lngData);
            for (var key of Object.keys(lngData)) {
              data[key] = lngData[key];
            }
          })
          .catch(e => {
            if (languages.length > 0)
              return tryLanguages(languages);
          });
}
const names = ['ac', 'de'];
//const names = Intl.getCanonicalLocales(navigator.languages);
await tryLanguages(names);
console.debug(LOGGER, 'ok');

class LanguageManager {

  message(key) {
    if (key in data) {
      if (arguments.length > 1) {
        let msg = data[key].replace(/({(\d)})/g, (m, _, idx) =>
          arguments[Number(idx) + 1]
        );
        return msg;
      }

      return data[key];
    }
    return key;
  }
}

const LM = new LanguageManager();
export default LM;
