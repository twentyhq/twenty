import { type CONDITIONAL_DISPLAY_PROPERTIES } from 'src/engine/metadata-modules/flat-conditional-display/constants/conditional-display-properties.constant';

export type ConditionalDisplayProperty =
  (typeof CONDITIONAL_DISPLAY_PROPERTIES)[number];
