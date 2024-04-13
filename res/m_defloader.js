
/**
 * Load a svg file and Map all id-Elements in 'defs'.
 * 
 * @returns {Promise} a promise returning a Map
 */
export default function loader(svgfile) {
  return fetch(svgfile).then(r => {
    if (r.ok) {
      return r.text();
    }
    throw r;
  }).then(str => {
    return new DOMParser().parseFromString(str, "image/svg+xml");
  }).then(svg => {
    let defs = [...svg.querySelectorAll('defs>[id]')];
    //console.debug('defs', defs);
    return new Map(defs.map(e => [e.id, e]));
  });
}
