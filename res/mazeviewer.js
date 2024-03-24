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
  if (q.has('view')) {

  } else {
//    for (let cb of document.querySelectorAll(
//            '#viewSettings input[type="checkbox"]')) {
//      cb.checked = true;
//    }
  }
}


function initSettings() {
  //console.group('settings');
  let settingsBlock = document.createDocumentFragment();
  for (let pos in window.mazedata.views) {
    let view = window.mazedata.views[pos];
    if ("displayName" in view) {
      //console.debug("view", view.displayName);
      let entry = document.createElement('label');
      let cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.name = 'view[]';
      cb.value = view.displayName;
      cb.onchange = (e) => {
        view.enabled = e.target.checked;
        document.getElementById('view' + pos)
                .dataset.enabled = view.enabled;
      };
      entry.append(cb);
      entry.append(view.displayName);

      settingsBlock.append(entry);
      cb.checked = view.enabled;
    }
  }
  document.querySelector("#viewSettings").replaceChildren(settingsBlock);
  //console.groupEnd();
}

function initPageContent() {
  console.debug('init page content');
  initRandomButton();
  initQuery();
  initSettings();
  console.debug('init done');
}
function initPageLoaded() {
  mazeinfo.update();
}

var viewTimer;
window.addEventListener('mazedata.views', evt => {
  if (viewTimer) {
    clearTimeout(viewTimer);
  }
  viewTimer = setTimeout(() => {
    console.debug("update page content");
    initSettings();
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
