import { registerEnumType } from '@nestjs/graphql';

export enum GraphColor {
  // Reds
  RED = 'RED',
  RUBY = 'RUBY',
  CRIMSON = 'CRIMSON',
  TOMATO = 'TOMATO',

  // Oranges & Yellows
  ORANGE = 'ORANGE',
  AMBER = 'AMBER',
  YELLOW = 'YELLOW',

  // Greens
  LIME = 'LIME',
  GRASS = 'GRASS',
  GREEN = 'GREEN',
  JADE = 'JADE',
  MINT = 'MINT',

  // Cyans & Blues
  TURQUOISE = 'TURQUOISE',
  CYAN = 'CYAN',
  SKY = 'SKY',
  BLUE = 'BLUE',

  // Purples & Pinks
  IRIS = 'IRIS',
  VIOLET = 'VIOLET',
  PURPLE = 'PURPLE',
  PLUM = 'PLUM',
  PINK = 'PINK',

  // Earth tones & Neutrals
  BRONZE = 'BRONZE',
  GOLD = 'GOLD',
  BROWN = 'BROWN',
  GRAY = 'GRAY',
}

registerEnumType(GraphColor, {
  name: 'GraphColor',
  description: 'Available colors for graph elements',
});
