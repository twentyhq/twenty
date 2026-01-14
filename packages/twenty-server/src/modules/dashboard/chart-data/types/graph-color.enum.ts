import { registerEnumType } from '@nestjs/graphql';

export enum GraphColor {
  // Reds
  RED = 'red',
  RUBY = 'ruby',
  CRIMSON = 'crimson',
  TOMATO = 'tomato',

  // Oranges & Yellows
  ORANGE = 'orange',
  AMBER = 'amber',
  YELLOW = 'yellow',

  // Greens
  LIME = 'lime',
  GRASS = 'grass',
  GREEN = 'green',
  JADE = 'jade',
  MINT = 'mint',

  // Cyans & Blues
  TURQUOISE = 'turquoise',
  CYAN = 'cyan',
  SKY = 'sky',
  BLUE = 'blue',

  // Purples & Pinks
  IRIS = 'iris',
  VIOLET = 'violet',
  PURPLE = 'purple',
  PLUM = 'plum',
  PINK = 'pink',

  // Earth tones & Neutrals
  BRONZE = 'bronze',
  GOLD = 'gold',
  BROWN = 'brown',
  GRAY = 'gray',
}

registerEnumType(GraphColor, {
  name: 'GraphColor',
  description: 'Available colors for graph elements',
});
