// The product hero's menu restyle palette: as the dark layer's wipe line
// crosses the nav band, the menu surface interpolates white -> near-black
// (and goes transparent mid-crossing so the wipe reads through it).
const LIGHT_CHANNEL = 255;
const DARK_CHANNEL = 20;

function backgroundAt(navProgress: number): string {
  const channel = Math.round(
    LIGHT_CHANNEL + (DARK_CHANNEL - LIGHT_CHANNEL) * navProgress,
  );
  return `rgb(${channel}, ${channel}, ${channel})`;
}

export const MENU_WIPE = {
  backgroundAt,
  transparent: 'transparent',
};
