import { type AnimationDimension } from '@ui/layout/AnimatedExpandableContainer/types/AnimationDimension';
import { getTransitionValues } from '@ui/layout/AnimatedExpandableContainer/utils/getTransitionValues';

export const getCommonStyles = (
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
) => ({
  opacity: 0,
  [dimension]: 0,
  ...getTransitionValues(dimension, opacityDuration, sizeDuration),
});
