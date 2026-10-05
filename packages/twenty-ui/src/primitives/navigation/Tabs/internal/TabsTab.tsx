import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../../internal/tab/Tab.module.scss';
import { TabsTabContent } from '../../internal/tab/TabsTabContent';
import { type TabsTabProps } from '../types/TabsTabProps';

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
