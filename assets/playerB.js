const PLAYER_ID = 'playerB';
const colors = {
  Default: {
    skin: "#FFD321",
    stroke: "#B18904",
    shirt: "#addf6b",
    pants: "#6b73df",
    shoes: "#8A4B08",
    eyes: "black",
    eyewhite: "whitesmoke",
    hair: "#6baddf",
    hairline: "#4a799c"
  },
  Jim: {
    skin: "Wheat",
    stroke: "BurlyWood",
    shirt: "skyblue",
    pants: "green",
    shoes: "saddlebrown",
    eyes: "darkblue",
    eyewhite: "whitesmoke",
    hair: "Chocolate",
    hairline: "Sienna"
  },
  Jon: {
    skin: "#8d5524",
    stroke: "#e0ac69",
    shirt: "red",
    pants: "blue",
    shoes: "black",
    eyes: "#63443d",
    eyewhite: "#fff7ee",
    hair: "#63443d",
    hairline: "#7f584d"
  }
};

export const asset = {
  view: 'playerB.svg',
  player: true,
  directions: {
    NORTH: {
      still: PLAYER_ID + '-nordM',
      offsetX: -4,
      offsetY: -4
    },
    SOUTH: {
      still: PLAYER_ID + '-suedM',
      offsetX: -4,
      offsetY: -4
    },
    WEST: {
      still: PLAYER_ID + '-linksM',
      offsetX: -4,
      offsetY: -4
    },
    EAST: {
      still: PLAYER_ID + '-rechtsM',
      offsetX: -4,
      offsetY: -4
    }
  },
  tail: (svg, maze, rng) => {
    //Farben des Characters festlegen.
    const charNames = Object.keys(colors);
    let charId = rng(charNames.length);
    console.debug('PLAYER', charId, charNames[charId]);
    for (const [name, color] of Object.entries(colors[charNames[charId]])) {
      console.debug('PLAYER', name, color);
      svg.style.setProperty("--" + PLAYER_ID + "-" + name, color);
    }
  }
};