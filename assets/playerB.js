const PLAYER_ID = 'playerB';

export const asset = {
  view: PLAYER_ID+'.svg',
  player: true,
  directions: {
    NORTH: {
      still: PLAYER_ID+'-nordM',
      offsetX:-4,
      offsetY:-4
    },
    SOUTH: {
      still: PLAYER_ID+'-suedM',
      offsetX:-4,
      offsetY:-4
    },
    WEST: {
      still: PLAYER_ID+'-linksM',
      offsetX:-4,
      offsetY:-4
    },
    EAST: {
      still: PLAYER_ID+'-rechtsM',
      offsetX:-4,
      offsetY:-4
    }
  }
};