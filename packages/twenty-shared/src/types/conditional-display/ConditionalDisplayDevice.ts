import { type CONDITIONAL_DISPLAY_DEVICES } from '@/constants/ConditionalDisplayDevices';

export type ConditionalDisplayDevice =
  (typeof CONDITIONAL_DISPLAY_DEVICES)[number];
