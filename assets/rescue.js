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
  view: 'rescue.svg',
  tiles: {
    decke: {
      transform: (_, u) => {
        u.setAttribute('data-z', 16);
        return "translate(34.5,9)";
      },
      validator: (_, t) => t === 'rescue-stand'
    },
    wallBottom: {
      transform: () => "translate(37,33)",
      validator: (_, t) => t !== 'rescue-stand'
    },
    wallLeft: {
      transform: () => "translate(19,29)",
      validator: (_, t) => t !== 'rescue-stand'
    }
  }
};