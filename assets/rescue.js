export const asset = {
  view: 'rescue.svg',
  tiles: {
    decke: {
      transform: (_, u) => {
        u.setAttribute('data-z', 16);
        return "translate(34.5,9)";
      },
      validator: (_, t) => t === 'rescue-stand'
    },
    wallBottom: {
      transform: () => "translate(37,33)",
      validator: (_, t) => t !== 'rescue-stand'
    },
    wallLeft: {
      transform: () => "translate(19,29)",
      validator: (_, t) => t !== 'rescue-stand'
    }
  }
};