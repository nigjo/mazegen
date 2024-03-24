import RandomKruskal from './RandomKruskal.js';
const mazeinfo = {};

function add(parent, view, pos) {
  let w = document.createElement('div');
  w.classList.add('view');
  w.classList.add(view.constructor.name);
  let shadow = w.attachShadow({
    mode: 'closed'
  });
  w.id = 'view' + pos;
  shadow.append(view.create());
  parent.append(w);
  return w;
}

mazeinfo.update = () => {
  //console.debug('update mazes');
  //create a daily maze
  const m = new RandomKruskal(
          window.mazedata.width,
          window.mazedata.height,
          window.mazedata.seedtext);
  document.querySelector('#seedtext')
          .textContent = ' "' + window.mazedata.seedtext + '"';

  let parent = document.createDocumentFragment();
  for (let pos of
          Object.keys(window.mazedata.views)) {
    let info = window.mazedata.views[pos];
    let generator = "generator" in info ? info.generator : info;
    let w = add(parent, generator(m), pos);
    w.dataset.enabled = info.enabled;
  }

  document.querySelector('#views').replaceChildren(parent);
};

mazeinfo.registerView = (pos, viewInfo) => {
  window.mazedata.views = window.mazedata.views || {};

  if ("generator" in viewInfo) {
    window.mazedata.views[Number(pos)] = viewInfo;
  } else if (viewInfo.name !== '') {
    window.mazedata.views[Number(pos)] = {
      displayName: viewInfo.name,
      generator: viewInfo
    };
  } else {
    let e = new Error();
    let stackTrace = e.stack.split("\n");
    //console.debug(stackTrace);
    let caller = stackTrace[1];
    console.warn('no "generator" in viewInfo from', caller);
    let callFkt = caller.substring(0, caller.indexOf('@'));
    //console.debug(callFkt);
    if (callFkt.length === 0) {
      let name = caller.substring(caller.lastIndexOf('/') + 1, caller.lastIndexOf('.'));
      window.mazedata.views[Number(pos)] = {
        displayName: name,
        generator: viewInfo
      };
    } else {
      window.mazedata.views[Number(pos)] = {
        displayName: callFkt,
        generator: viewInfo
      };
    }
  }

  window.mazedata.views[Number(pos)].enabled = true;
  console.log('registered view at', Number(pos));

  window.dispatchEvent(new CustomEvent('mazedata.views'));
};


export default mazeinfo;
