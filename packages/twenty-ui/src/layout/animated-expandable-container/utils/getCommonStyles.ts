import { AnimationDimension } from '@ui/layout/animated-expandable-container/types/AnimationDimension';
import { getTransitionValues } from '@ui/layout/animated-expandable-container/utils/getTransitionValues';

export const getCommonStyles = (
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
) => ({
  opacity: 0,
  [dimension]: 0,
  ...getTransitionValues(dimension, opacityDuration, sizeDuration),
});
