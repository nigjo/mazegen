
export const asset = {
  view: 'boat.svg',
  id: 'boot',
  width: 32,
  height: 32,
  tiles: {
    wallTop: {
      ids: ['boot'],
      validator: (cell) => cell.row > 0,
      transform: modifySvgPlacement
    }
  },
  active: true
};

function modifySvgPlacement(tile) {
  let cell = tile.parentNode;
  let row = cell.parentNode;
  let offset = 10;
  if (cell.previousElementSibling
          && cell.previousElementSibling.querySelector('.doorTop')) {
    offset -= 24;
  } else if (cell.nextElementSibling
          && cell.nextElementSibling.querySelector('.doorTop')) {
    offset += 14;
  }
  return 'translate(' + (offset) + ',-22) scale(1.5,1.5)';
}