import { AMBER_COLOR_TOKENS } from './amber';
import { BLUE_COLOR_TOKENS } from './blue';
import { BRONZE_COLOR_TOKENS } from './bronze';
import { BROWN_COLOR_TOKENS } from './brown';
import { CRIMSON_COLOR_TOKENS } from './crimson';
import { CYAN_COLOR_TOKENS } from './cyan';
import { GOLD_COLOR_TOKENS } from './gold';
import { GRASS_COLOR_TOKENS } from './grass';
import { GRAY_COLOR_TOKENS } from './gray';
import { GREEN_COLOR_TOKENS } from './green';
import { IRIS_COLOR_TOKENS } from './iris';
import { JADE_COLOR_TOKENS } from './jade';
import { LIME_COLOR_TOKENS } from './lime';
import { MINT_COLOR_TOKENS } from './mint';
import { ORANGE_COLOR_TOKENS } from './orange';
import { PINK_COLOR_TOKENS } from './pink';
import { PLUM_COLOR_TOKENS } from './plum';
import { PURPLE_COLOR_TOKENS } from './purple';
import { RED_COLOR_TOKENS } from './red';
import { RUBY_COLOR_TOKENS } from './ruby';
import { SKY_COLOR_TOKENS } from './sky';
import { TOMATO_COLOR_TOKENS } from './tomato';
import { TURQUOISE_COLOR_TOKENS } from './turquoise';
import { VIOLET_COLOR_TOKENS } from './violet';
import { YELLOW_COLOR_TOKENS } from './yellow';
import { token } from '../token';

export const MAIN_COLOR_TOKENS = {
  red: RED_COLOR_TOKENS.scale.red9,
  ruby: RUBY_COLOR_TOKENS.scale.ruby9,
  crimson: CRIMSON_COLOR_TOKENS.scale.crimson9,
  tomato: TOMATO_COLOR_TOKENS.scale.tomato9,
  orange: ORANGE_COLOR_TOKENS.scale.orange9,
  amber: AMBER_COLOR_TOKENS.scale.amber9,
  yellow: YELLOW_COLOR_TOKENS.scale.yellow9,
  lime: LIME_COLOR_TOKENS.scale.lime9,
  grass: GRASS_COLOR_TOKENS.scale.grass9,
  green: GREEN_COLOR_TOKENS.scale.green9,
  jade: JADE_COLOR_TOKENS.scale.jade9,
  mint: MINT_COLOR_TOKENS.scale.mint9,
  turquoise: TURQUOISE_COLOR_TOKENS.scale.turquoise9,
  cyan: CYAN_COLOR_TOKENS.scale.cyan9,
  sky: SKY_COLOR_TOKENS.scale.sky9,
  blue: BLUE_COLOR_TOKENS.scale.blue9,
  iris: IRIS_COLOR_TOKENS.scale.iris9,
  violet: VIOLET_COLOR_TOKENS.scale.violet9,
  purple: PURPLE_COLOR_TOKENS.scale.purple9,
  plum: PLUM_COLOR_TOKENS.scale.plum9,
  pink: PINK_COLOR_TOKENS.scale.pink9,
  bronze: BRONZE_COLOR_TOKENS.scale.bronze9,
  gold: GOLD_COLOR_TOKENS.scale.gold9,
  brown: BROWN_COLOR_TOKENS.scale.brown9,
  gray: token({
    light: GRAY_COLOR_TOKENS.scale.gray9.light,
    dark: GRAY_COLOR_TOKENS.scale.gray7.dark,
  }),
};
