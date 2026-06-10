import { BREAKPOINT_PX } from './breakpoints';
import { UNITS } from './units';

const FLUID_VIEWPORT_MIN_PX = 390;
const ROOT_FONT_SIZE_PX = 16;

const round = (value: number): number => Math.round(value * 10000) / 10000;

// The one fluid-typography mechanism: text scales linearly between a small
// phone and the lg breakpoint, clamped at both ends. Multipliers are in the
// same font-base units as fontSize().
export const fluidFontSize = (
  minMultiplier: number,
  maxMultiplier: number,
): string => {
  const minRem = UNITS.fontBaseRem * minMultiplier;
  const maxRem = UNITS.fontBaseRem * maxMultiplier;

  if (minRem === maxRem) {
    return `${minRem}rem`;
  }

  const minPx = minRem * ROOT_FONT_SIZE_PX;
  const maxPx = maxRem * ROOT_FONT_SIZE_PX;
  const slopePxPerViewportPx =
    (maxPx - minPx) / (BREAKPOINT_PX.lg - FLUID_VIEWPORT_MIN_PX);
  const interceptRem =
    (minPx - slopePxPerViewportPx * FLUID_VIEWPORT_MIN_PX) / ROOT_FONT_SIZE_PX;
  const viewportCoefficient = slopePxPerViewportPx * 100;

  return `clamp(${minRem}rem, ${round(interceptRem)}rem + ${round(viewportCoefficient)}vw, ${maxRem}rem)`;
};
