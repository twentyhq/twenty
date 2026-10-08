import { type Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';

import { type AnimationDuration } from '@ui/theme';

import { type AnimationDimension } from './AnimationDimension';

export type CollapsiblePanelProps = CollapsiblePrimitive.Panel.Props & {
  dimension?: AnimationDimension;
  containAnimation?: boolean;
  duration?: AnimationDuration;
};
