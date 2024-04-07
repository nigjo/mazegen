import RandomKruskal from './RandomKruskal.js';
import ThumbMaze from './ThumbMaze.js';

function thumb(generator) {
  if (generator.thumbnail) {
    return generator.thumbnail;
  }

  let thumbMaze = new ThumbMaze();
  let thumbGen = new generator.constructor(thumbMaze);
  if ('viewProps' in generator.constructor) {
    generator.constructor.viewProps.forEach(k => thumbGen[k] = generator[k]);
  }
  generator.thumbnail = thumbGen.create();

  return generator.thumbnail;
}

const mazeinfo = {};

const views = new Map();

function addThumb(parent, view, pos) {
  let w = document.createElement('div');
  w.classList.add('view');
  w.dataset['view'] = view.constructor.name;
  let shadow = w.attachShadow({
    mode: 'closed'
  });
  w.id = 'view' + pos;
  w.style.width = '4em';
  w.style.height = '4em';
  let viewContent;
  viewContent = thumb(view);
  shadow.append(viewContent);
  parent.append(w);
  function setThumbStyles(thumb) {
    thumb.style.margin = '0px';
    thumb.style.width = '100%';
    thumb.style.height = '100%';
  }
  function scaling(w, viewContent) {
    //console.log(view.constructor.name, viewContent);
    if (viewContent.tagName === 'svg') {
      setThumbStyles(viewContent);
    } else {
      //console.log('No SVG');
      let svg = viewContent.querySelector('svg');
      if (svg) {
        setThumbStyles(viewContent);
        svg.style.maxWidth = '100%';
        svg.style.maxHeight = '100%';
      } else if (w.clientWidth === 0) {
        viewContent.style.visibility = 'hidden';
        setTimeout(scaling, 0, w, viewContent);
      } else {
        setThumbStyles(viewContent);
        viewContent.style.visibility = 'visible';
        let width = w.clientWidth / viewContent.scrollWidth;
        let height = w.clientHeight / viewContent.scrollHeight;
        if (width < 1 || height < 1) {
          //console.log('scale', width, height);
          viewContent.style.transformOrigin = '0 0';
          viewContent.style.transform = 'scale(' + Math.min(width, height) + ')';
        }
      }
    }
  }
  scaling(w, viewContent);

  w.onclick = (e) => {
    setMainView(e.target);
  };

  return w;
}

function setMainView(viewThumb) {
  console.debug('main', viewThumb);
  let generator = views.get(viewThumb.id);
  if (generator) {
    let content = generator.create();
    document.getElementById('mainview')
            .replaceChildren(content);

    let lastSel = document.querySelector('#views>[data-selected]');
    if (lastSel !== viewThumb) {
      delete lastSel.dataset.selected;
      viewThumb.dataset.selected = 'true';
    }
  } else {
    console.warn('unable to find generator', views);
  }
}

mazeinfo.update = (withThumbs = false) => {
  //console.debug('update mazes');
  //create a daily maze
  const m = new RandomKruskal(
          window.mazedata.width,
          window.mazedata.height,
          window.mazedata.seedtext);
  document.querySelector('#seedtext')
          .textContent = ' "' + window.mazedata.seedtext + '"';

  if ("views" in window.mazedata) {

    let thumbViews = document.querySelector('#views');
    if (withThumbs || thumbViews.firstElementChild.tagName === 'P') {
      let parent = document.createDocumentFragment();
      for (let pos of
              Object.keys(window.mazedata.views)) {
        let info = window.mazedata.views[pos];
        let generator = "generator" in info ? info.generator : info;
        let view = generator(m);
        let w = addThumb(parent, view, pos);
        views.set(w.id, view);
        w.dataset.enabled = info.enabled;
      }

      thumbViews.replaceChildren(parent);
      thumbViews.firstElementChild.dataset.selected = 'true';
      //console.log('first', thumbViews.firstElementChild);
    } else {
      for (let pos of
              Object.keys(window.mazedata.views)) {
        let info = window.mazedata.views[pos];
        let generator = "generator" in info ? info.generator : info;
        views.set('view' + pos, generator(m));
      }
    }

    let selected = thumbViews.querySelector('[data-selected]');
    if (selected && !selected.classList.contains('placeholder')) {
      setMainView(selected);
    }
}
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
