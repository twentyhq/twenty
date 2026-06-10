import { BREAKPOINT_PX } from './breakpoints';
import { UNITS } from './units';
import { TYPE_SCALE, type TypeStep } from './type-scale';

// Fluid type ramps: size AND leading interpolate linearly between the two
// DESIGNED steps across [390px, md], rendering the exact designed values at
// both ends and holding constant beyond. In between, text fills its growing
// measure and reflows (text-wrap: balance) — heading and body share one
// physics instead of stepping or freezing.
const FLUID_VIEWPORT_MIN_PX = 390;
const ROOT_FONT_SIZE_PX = 16;
const RUNNING_TEXT_LINE_HEIGHT = '1.55';

const round = (value: number): number => Math.round(value * 10000) / 10000;

const fluidBetween = (baseMultiplier: number, mdMultiplier: number): string => {
  const minRem = UNITS.fontBaseRem * baseMultiplier;
  const maxRem = UNITS.fontBaseRem * mdMultiplier;

  if (minRem === maxRem) return `${minRem}rem`;

  const minPx = minRem * ROOT_FONT_SIZE_PX;
  const maxPx = maxRem * ROOT_FONT_SIZE_PX;
  const slope = (maxPx - minPx) / (BREAKPOINT_PX.md - FLUID_VIEWPORT_MIN_PX);
  const interceptRem =
    (minPx - slope * FLUID_VIEWPORT_MIN_PX) / ROOT_FONT_SIZE_PX;

  return `clamp(${minRem}rem, ${round(interceptRem)}rem + ${round(slope * 100)}vw, ${maxRem}rem)`;
};

const lineHeightValue = (base: TypeStep, md: TypeStep): string => {
  if (base.lineHeight === null || md.lineHeight === null) {
    return RUNNING_TEXT_LINE_HEIGHT;
  }
  return fluidBetween(base.lineHeight, md.lineHeight);
};

export const typeRampDeclarations = (ramp: keyof typeof TYPE_SCALE): string => {
  const { base, md } = TYPE_SCALE[ramp];

  return [
    `font-size: ${fluidBetween(base.size, md.size)};`,
    `line-height: ${lineHeightValue(base, md)};`,
  ].join('\n');
};
