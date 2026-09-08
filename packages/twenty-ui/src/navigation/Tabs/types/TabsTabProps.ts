import { type Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { type ReactNode } from 'react';

import { type TabsSize } from './TabsSize';

export type TabsTabProps = TabsPrimitive.Tab.Props & {
  startIcon?: ReactNode;
  badge?: ReactNode;
  size?: TabsSize;
};
