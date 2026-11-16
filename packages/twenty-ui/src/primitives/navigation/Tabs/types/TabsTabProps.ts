import { type Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { type ComponentProps, type ReactNode } from 'react';

import { type TabsSize } from './TabsSize';
import { type TabsVariant } from './TabsVariant';

export type TabsTabProps = ComponentProps<typeof TabsPrimitive.Tab> & {
  /** Icon rendered before the label. */
  startIcon?: ReactNode;
  /** Content rendered after the label, such as a count. */
  badge?: ReactNode;
  endIcon?: ReactNode;
  highlighted?: boolean;
  /** Visual size of the tab. */
  size?: TabsSize;
  /** `filled` keeps a background behind the selected tab instead of relying on an indicator. */
  variant?: TabsVariant;
};
