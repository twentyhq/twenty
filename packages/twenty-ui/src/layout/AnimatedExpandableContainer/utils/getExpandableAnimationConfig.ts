import { type AnimationDimension } from '@ui/layout/AnimatedExpandableContainer/types/AnimationDimension';
import { type AnimationSize } from '@ui/layout/AnimatedExpandableContainer/types/AnimationSize';
import { getCommonStyles } from '@ui/layout/AnimatedExpandableContainer/utils/getCommonStyles';
import { getTransitionValues } from '@ui/layout/AnimatedExpandableContainer/utils/getTransitionValues';

export const getExpandableAnimationConfig = (
  isExpanded: boolean,
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
  size: AnimationSize,
) => ({
  initial: {
    ...getCommonStyles(dimension, opacityDuration, sizeDuration),
  },
  animate: {
    opacity: 1,
    [dimension]: isExpanded
      ? size === 'fit-content'
        ? 'fit-content'
        : dimension === 'width'
          ? '100%'
          : size
      : 0,
    ...getTransitionValues(dimension, opacityDuration, sizeDuration),
  },
  exit: {
    ...getCommonStyles(dimension, opacityDuration, sizeDuration),
  },
});
