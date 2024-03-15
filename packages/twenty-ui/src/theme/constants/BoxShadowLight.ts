import { GRAY_SCALE } from './GrayScale';
import { RGBA } from './Rgba';

export const BOX_SHADOW_LIGHT = {
  light: `0px 2px 4px 0px ${RGBA(
    GRAY_SCALE.gray100,
    0.04,
  )}, 0px 0px 4px 0px ${RGBA(GRAY_SCALE.gray100, 0.08)}`,
  strong: `2px 4px 16px 0px ${RGBA(
    GRAY_SCALE.gray100,
    0.12,
  )}, 0px 2px 4px 0px ${RGBA(GRAY_SCALE.gray100, 0.04)}`,
  underline: `0px 1px 0px 0px ${RGBA(GRAY_SCALE.gray100, 0.32)}`,
  superHeavy: `0px 0px 8px 0px ${RGBA(
    GRAY_SCALE.gray100,
    0.16,
  )}, 0px 8px 64px -16px ${RGBA(
    GRAY_SCALE.gray100,
    0.48,
  )}, 0px 24px 56px -16px ${RGBA(GRAY_SCALE.gray100, 0.08)}`,
};
