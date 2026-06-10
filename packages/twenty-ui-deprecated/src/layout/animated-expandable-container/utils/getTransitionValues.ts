import { type AnimationDimension } from '@ui/layout/animated-expandable-container/types/AnimationDimension';

export const getTransitionValues = (
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
) => ({
  transition: {
    opacity: {
      duration: opacityDuration,
      ease: 'easeInOut',
    },
    [dimension]: {
      duration: sizeDuration,
      ease: 'easeInOut',
    },
  },
});
