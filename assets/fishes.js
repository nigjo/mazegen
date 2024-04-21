export const asset = {
  view: 'fishes.svg',
  tiles: {
    wallBottom: {
      validator: (cell, id) => id.endsWith('b'),
      transform: () => "translate(16,52)"
    },
    wallRight: {
      validator: (cell, id) => id.endsWith('r'),
      transform: () => "translate(48,16)"
    }
  }
};
