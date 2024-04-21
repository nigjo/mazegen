export const asset = {
  view: 'fishes.svg',
  tiles: {
    wallBottom: {
      validator: (cell, id) => id.endsWith('b'),
      transform: () => "translate(16,52)"
    }
  }
};
