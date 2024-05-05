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
  view: 'cracks.svg',
  tiles: {
    doorTop: {transform: (_, u) => {
        u.setAttribute('data-z', 1);
        return "translate(32,12)";
      }},
    doorLeft: {transform: (_, u) => {
        u.setAttribute('data-z', 1);
        return "translate(16,16)";
      }},
    doorRight: {transform: (_, u) => {
        u.setAttribute('data-z', 1);
        return "translate(36,28)";
      }},
    doorBottom: {transform: (_, u) => {
        u.setAttribute('data-z', 1);
        return "translate(20,32)";
      }},
    wallTop: {transform: (_, u) => {
        u.setAttribute('data-z', 1);
        return "translate(20,28)";
      }},
    wallLeft: {transform: (_, u) => {
        u.setAttribute('data-z', 1);
        return "translate(20,16)";
      }},
    wallRight: {transform: (_, u) => {
        u.setAttribute('data-z', 1);
        return "translate(32,28)";
      }},
    wallBottom: {transform: (_, u) => {
        u.setAttribute('data-z', 1);
        return "translate(32,16)";
      }}
  }
};

