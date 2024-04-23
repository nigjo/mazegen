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

//nur jede 2. doorLeft/Right hat Chance auf Relief
let active = true;

export const asset = {
  view: 'relief.svg',
  tiles: {
    wallBottom: {
      transform: (t, u) => {
        //++posModifier;
        let pos = t.getAttribute('data-pos')
        let x = 20.75 + 4 * pos;
        t.removeAttribute('data-pos')
        console.debug("RELIEF", t, u);
        return  "translate(" + x + ",44)"
      }
    },
    doorLeft: {
      validator: () => {
        return active = !active;
      },
      transform: "translate(4.75,40)"
    },
    doorRight: {
      validator: () => {
        return active = !active;
      },
      transform: "translate(52.75,40)"
    }
  },
  tail: (svg, _, rng) => {
    // add "random" position
    let reliefItems = svg.querySelectorAll('use[data-item^="relief"]');
    [...reliefItems]
            .filter(i => i.getAttribute('class') === 'wallBottom')
            .forEach(i => i.setAttribute('data-pos', rng(4)));
  }
};
