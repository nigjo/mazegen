import mazeinfo from './m_mazeinfo.js';

function updateMaze(evt) {
  //console.debug(evt);
  evt.preventDefault();
  window.mazedata.seedtext = evt.target.seedText.value;
  window.mazedata.width = Number(evt.target.width.value);
  window.mazedata.height = Number(evt.target.height.value);
  mazeinfo.update();
  return false;
}
document.forms.settings.onsubmit = updateMaze;

let alphabeth = "abcdefghijklmnopqrstuvwxyz";
alphabeth += alphabeth.toUpperCase();
alphabeth += "0123456789";
function createRandom() {
  let form = document.forms.settings;
  let seed = '';
  for (let i = 0; i < 12; i++) {
    seed += alphabeth.charAt(Math.random() * alphabeth.length);
  }
  form.seedText.value = seed;
  form.requestSubmit();
}
function initRandomButton() {
  document.querySelector("#settings input[value='Random']")
          .onclick = createRandom;
}

function initQuery() {
  //console.debug('init query');
  let q = new URLSearchParams(location.search);
  let form = document.forms.settings;
  if (q.has('seedText')) {
    window.mazedata.seedtext
            = form.seedText.value
            = q.get('seedText');
  }
  if (q.has('width')) {
    window.mazedata.width
            = form.width.value
            = Number(q.get('width'));
  }
  if (q.has('height')) {
    window.mazedata.height
            = form.height.value
            = Number(q.get('height'));
  }
}

console.debug('base', document.readyState);
if (document.readyState === 'loading') {
  console.debug('wait for page');
  document.addEventListener('readystatechange', (e) => {
    if (document.readyState === 'interactive') {
      initRandomButton();
      initQuery();
    }
  });
  document.addEventListener('DOMContentLoaded', mazeinfo.update);
} else {
  initRandomButton();
  initQuery();
  mazeinfo.update();
}
