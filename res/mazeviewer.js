function add(parent, view) {
  let w = document.createElement('div');
  w.classList.add('view');
  w.classList.add(view.constructor.name);
  let shadow = w.attachShadow({
    mode: 'closed'
  });
  shadow.append(view.create());
  parent.append(w);
}

import RandomKruskal from './RandomKruskal.js';

import IsometricView from './v_isometric.js';
import TextView from './v_textview.js';
import TopView from './v_topview.js';
import MincraftView from './v_minecraft.js';

window.mazeinfo.update = () => {
  console.debug('update mazes');
  //create a daily maze
  const m = new RandomKruskal(
          window.mazeinfo.width,
          window.mazeinfo.height,
          window.mazeinfo.seedtext);
  document.querySelector('#seedtext')
          .textContent = ' "' + window.mazeinfo.seedtext + '"';

  let parent = document.createDocumentFragment();

  add(parent, new IsometricView(m));
  add(parent, new TextView(m));
  let box = new TextView(m);
  box.boxView = true;
  add(parent, box);
  add(parent, new TopView(m));
  add(parent, new MincraftView(m));

  document.querySelector('#views').replaceChildren(parent);
};

if (document.readyState === 'loading') {
  console.debug('wait for page');
  document.addEventListener('DOMContentLoaded', window.mazeinfo.update);
} else {
  window.mazeinfo.update();
}
