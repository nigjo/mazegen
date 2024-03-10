import RandomKruskal from './RandomKruskal.js';

const mazeinfo = {};

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
    let generator = window.mazedata.views[pos];
    add(parent, generator(m));
  }

  document.querySelector('#views').replaceChildren(parent);
};

mazeinfo.registerView =(pos, viewGenerator)=>{
  window.mazedata.views = window.mazedata.views || {};
  
  window.mazedata.views[Number(pos)] = viewGenerator;
};


export default mazeinfo;