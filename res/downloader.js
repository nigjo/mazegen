function getMainViewData() {
  let host = document.querySelector('#mainview .viewHost');
  let thumbId = host.dataset.thumb;
  let thumb = document.getElementById(thumbId);
  let filename = 'maze-' + thumb.dataset.view;
  console.log("download", filename);
  let svg = host.shadowRoot.querySelector('svg');
  let filecontent = new Blob([
    new XMLSerializer().serializeToString(svg)
  ], {
    type: 'image/svg+xml;charset=utf-8'
  });
  const url = URL.createObjectURL(filecontent);
  return [filename, url];
}

function dlBlob(filename, dataurl) {
  let a = document.createElement('a');
  a.href = dataurl;
  a.download = filename;
  document.body.append(a);
  console.debug(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(dataurl);
    a.remove();
  });
}

function svgDownloader() {
  let filename, svgurl;
  [filename, svgurl] = getMainViewData();
  dlBlob(filename + ".svg", svgurl);
}

function pngDownloader() {
  const canvas = document.createElement('canvas');
  let host = document.querySelector('#mainview .viewHost');
  let svg = host.shadowRoot.querySelector('svg');
  canvas.width = svg.getAttribute('width');
  canvas.height = svg.getAttribute('height');
  var ctx = canvas.getContext("2d");
  var img = new Image();
  let filename, svgurl;
  [filename, svgurl] = getMainViewData();
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    var png = canvas.toDataURL("image/png");
    dlBlob(filename + ".png", png);
  };
  img.src = svgurl;
}

function updateButtons() {
  let btnSvgDL = document.getElementById('svgDownloader');
  let btnPngDL = document.getElementById('pngDownloader');
  let host = document.querySelector('#mainview .viewHost');
  let svg = host.shadowRoot.querySelector('svg');
  console.log("update Buttons", svg);
  if (svg) {
    btnSvgDL.disabled = false;
    btnPngDL.disabled = false;
  } else {
    btnSvgDL.disabled = true;
    btnPngDL.disabled = true;
  }
}
document.addEventListener('mazeinfo.viewChanged', updateButtons);
