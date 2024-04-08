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

let historyLoop = false;
function updateHistory(evt) {
  if (historyLoop)
    return;
  //console.debug('updating history', evt);
  let q = new URLSearchParams();
  let form = document.forms.settings;
  q.set('seedText', form.seedText.value);
  q.set('width', Number(form.width.value));
  q.set('height', Number(form.height.value));
  let viewId = document.querySelector('#views>[data-selected]').id;
  q.set('view', viewId);
  history.pushState({}, null, './?' + q);
}
document.addEventListener('mazeinfo.viewChanged', updateHistory);
window.addEventListener('popstate', () => {
  console.log('POP');
  historyLoop = true;
  initQuery();
  document.forms.settings.requestSubmit();
  historyLoop = false;
});

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
    let thumbView = document.getElementById(q.get('view'));
    if (thumbView) {
      thumbView.click();
    } else {
      console.warn('thumbView', 'unable to find view', q.get('view'));
      console.debug('thumbView', document.querySelectorAll('#views[data-view]'));
    }
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
  historyLoop = true;
  mazeinfo.update(true);
  historyLoop = false;
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
