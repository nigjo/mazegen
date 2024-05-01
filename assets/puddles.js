export const asset = {
  view: 'puddles.svg',
  tiles: {
    boden: {
      transform: (_, u) => {
        u.setAttribute('data-z', 8);
        return 'translate(36,34)';
      }
    },
    decke: {
      transform: (_, u) => {
        u.setAttribute('data-z', 8);
        return 'translate(21,16)';
      }
    },
    doorLeft: {
      transform: (_, u) => {
        u.setAttribute('data-z', 8);
        return 'translate(8,31)';
      }
    },
    doorRight: {
      transform: (_, u) => {
        u.setAttribute('data-z', 8);
        return 'translate(52,18)';
      }
    },
    doorTop: {
      transform: (_, u) => {
        u.setAttribute('data-z', 8);
        return 'translate(35,0)';
      }
    },
    doorBottom: {
      transform: (_, u) => {
        u.setAttribute('data-z', 8);
        return 'translate(20,44)';
      }
    }
  }
};

