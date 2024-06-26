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
import settings from './m_usersettings.js';
const LOGGER = 'LANG';

const knownLocales = [];
console.debug(LOGGER, 'initialize...');
const data = await Promise.all([
  fetch('res/locale/lang.json').then(r => r.json()),
  fetch('res/locale/locales.json').then(r => r.json())
]).then(basedata => {
  let data = basedata[0];
  let known = basedata[1];
  knownLocales.push(...known.map(name => name.match(/lang_?(\w+)?\.json/)[1]));

  const names = Intl.getCanonicalLocales(navigator.languages);
  if (settings.locale) {
    if ('default' === settings.locale) {
      return data;
    }
    names.unshift(settings.locale);
  }
  //console.debug(LOGGER, names);
  const userLanguages = new Set(names);
  for (let lang of userLanguages) {
    let filename = 'lang_' + lang + '.json';
    if (known.includes(filename)) {
      return tryLanguage(filename, lang, data);
    }
  }
  return data;
});

//console.debug(LOGGER, 'loading...');
async function tryLanguage(filename, lang, data) {
//  const lang = languages.shift();
  console.debug(LOGGER, 'try', filename);
  await fetch('res/locale/' + filename)
          .then(r => {
            if (r.ok)
              return r.json();
            else
              throw r;
          })
          .then(lngData => {
            if (!lngData) {
              throw "missing data for " + lang;
            }
            //console.debug(LOGGER, 'loaded', lang, lngData);
            if (!settings.locale) {
              settings.locale = lang;
              settings.store();
            }
            for (var key of Object.keys(lngData)) {
              data[key] = lngData[key];
            }
          })
          .catch(e => {
            //console.warn(LOGGER, e);
//            if (languages.length > 0) {
//              return tryLanguages(languages);
//            } else {
            console.warn(LOGGER, 'no preferred locale found', e);
//            }
          });
  return data;
}
//const names = ['ac', 'de'];
//const names = Intl.getCanonicalLocales(navigator.languages);
//if (settings.locale) {
//  names.unshift(settings.locale);
//}
//console.debug(LOGGER, names);
//const userLanguages = [... new Set(names)];
//console.debug(LOGGER, userLanguages);
//await tryLanguages(userLanguages);
//console.debug(LOGGER, knownLocales);
console.debug(LOGGER, 'initialized');


class LanguageManager {

  has(key) {
    return key in data;
  }
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
  updatePage() {
    const keys = document.querySelectorAll('[data-l10nkey]');
    for (var item of keys) {
      if (LM.has(item.dataset.l10nkey))
        item.textContent = LM.message(item.dataset.l10nkey);
    }
  }
  fillSelect(target) {
    function regionIndicator(c) {
      const l = c.toLowerCase().substring(0, 2);
      const base = 0x1F1E6 - 'a'.charCodeAt(0);
      return String.fromCodePoint(base + l.charCodeAt(0), base + l.charCodeAt(1));
    }
    const names = new Intl.DisplayNames(undefined, {type: 'language'});
    for (var lang of knownLocales) {
      const option = document.createElement('option');
      option.setAttribute('value', lang || 'default');
      if (lang) {
        option.textContent = regionIndicator(lang) + ' ' + names.of(lang);
      } else {
//        option.textContent = '\uD83C\u{0xDDE6+}\uD83C\uDDE6';
        option.textContent = regionIndicator('gb') + ' ' + names.of('en');
      }
      target.append(option);
    }
  }
}

const LM = new LanguageManager();
export default LM;
