export const asset = {
  view: 'vine.svg',
  tiles: {
    wallBottom: {
      transform: () => "translate(16,44)",
      validator: (_, id) => {
        return id !== 'vinesSingle';
      }
    },
    doorLeft: {
      transform: () => "translate(4,40)",
      validator: (_, id) => {
        return id === 'vinesSingle';
      }
    },
    doorRight: {
      transform: () => "translate(48,40)",
      validator: (_, id) => {
        return id === 'vinesSingle';
      }
    }
  }
};