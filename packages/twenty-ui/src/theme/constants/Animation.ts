import { THEME_LIGHT } from './ThemeLight';

export const ANIMATION = THEME_LIGHT.animation;

export type AnimationDuration = keyof typeof ANIMATION.duration;
