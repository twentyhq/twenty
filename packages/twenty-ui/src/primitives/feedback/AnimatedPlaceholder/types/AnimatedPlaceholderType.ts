import { type BACKGROUND } from '@ui/feedback/AnimatedPlaceholder/constants/Background';
import { type MOVING_IMAGE } from '@ui/feedback/AnimatedPlaceholder/constants/MovingImage';

export type AnimatedPlaceholderType =
  | keyof typeof BACKGROUND
  | keyof typeof MOVING_IMAGE;
