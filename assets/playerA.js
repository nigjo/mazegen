export const asset = {
  view: 'playerA.svg',
  player: true,
  directions: {
    NORTH: {
      still: 'playerA-nordM',
      offsetX:-4,
      offsetY:-4,
      steps: [
        'playerA-nordL',
        'playerA-nordM',
        'playerA-nordR',
        'playerA-nordM'
      ]
    },
    SOUTH: {
      still: 'playerA-suedM',
      offsetX:-4,
      offsetY:-4
    },
    WEST: {
      still: 'playerA-linksM',
      offsetX:-4,
      offsetY:-4
    },
    EAST: {
      still: 'playerA-rechtsM',
      offsetX:-4,
      offsetY:-4
    }
  }
};