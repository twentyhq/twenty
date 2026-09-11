import { type Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { type ReactNode } from 'react';

import { type TabsSize } from './TabsSize';

export type TabsTabProps = TabsPrimitive.Tab.Props & {
  /** Icon rendered before the label. */
  startIcon?: ReactNode;
  /** Content rendered after the label, such as a count. */
  badge?: ReactNode;
  /** Visual size of the tab. */
  size?: TabsSize;
};
