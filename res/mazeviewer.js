import mazeinfo from './m_mazeinfo.js';

function updateMaze(evt) {
  //console.debug(evt);
  evt.preventDefault();
  window.mazedata.seedtext = evt.target.seedText.value;
  window.mazedata.width = Number(evt.target.width.value);
  window.mazedata.height = Number(evt.target.height.value);
  mazeinfo.update(false);
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
  } else {
    form.seedText.value = window.mazedata.seedtext;
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
  if (q.has('view')) {

  } else {
//    for (let cb of document.querySelectorAll(
//            '#viewSettings input[type="checkbox"]')) {
//      cb.checked = true;
//    }
  }
}

function initPageContent() {
  console.debug('init page content');
  initRandomButton();
  initQuery();
  console.debug('init done');
}
function initPageLoaded() {
  mazeinfo.update(true);
}

var viewTimer;
window.addEventListener('mazedata.views', evt => {
  if (viewTimer) {
    clearTimeout(viewTimer);
  }
  viewTimer = setTimeout(() => {
    console.debug("update page content");
    initPageLoaded();
  }, 0);
});

console.debug('base', document.readyState);
if (document.readyState === 'loading') {
  console.debug('wait for page');
  document.addEventListener('readystatechange', (e) => {
    if (document.readyState === 'interactive') {
      initPageContent();
    }
  });
  document.addEventListener('DOMContentLoaded', initPageLoaded);
} else {
  initPageContent();
  initPageLoaded();
}
