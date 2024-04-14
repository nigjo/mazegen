export const asset = {
  view: 'rescue.svg',
  tiles: {
    decke:{
      transform:()=>"translate(35,10)",
      validator:(_,t)=>t==='rescue-stand'
    },
    wallBottom:{
      transform:()=>"translate(37,33)",
      validator:(_,t)=>t!=='rescue-stand'
    },
    wallLeft:{
      transform:()=>"translate(19,29)",
      validator:(_,t)=>t!=='rescue-stand'
    }
  }  
};