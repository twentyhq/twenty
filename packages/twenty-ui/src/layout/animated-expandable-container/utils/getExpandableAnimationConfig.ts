import { AnimationDimension } from '@ui/layout/animated-expandable-container/types/AnimationDimension';
import { AnimationSize } from '@ui/layout/animated-expandable-container/types/AnimationSize';
import { getCommonStyles } from '@ui/layout/animated-expandable-container/utils/getCommonStyles';
import { getTransitionValues } from '@ui/layout/animated-expandable-container/utils/getTransitionValues';

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
