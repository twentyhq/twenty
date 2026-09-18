import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Tabs.module.scss';
import { type TabsTabProps } from '../types/TabsTabProps';
import { TabsTabContent } from './TabsTabContent';

export const TabsTab = ({
  className,
  children,
  startIcon,
  endIcon,
  badge,
  highlighted = false,
  size = 'sm',
  ...props
}: TabsTabProps) => (
  <TabsPrimitive.Tab
    {...props}
    className={mergeClassNames(styles.tab, className)}
    data-size={size}
    data-highlighted={highlighted || undefined}
  >
    <TabsTabContent startIcon={startIcon} endIcon={endIcon} badge={badge}>
      {children}
    </TabsTabContent>
  </TabsPrimitive.Tab>
);
