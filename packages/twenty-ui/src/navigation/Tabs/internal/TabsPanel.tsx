import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Tabs.module.scss';
import { type TabsPanelProps } from '../types/TabsPanelProps';

export const TabsPanel = ({ className, ...props }: TabsPanelProps) => (
  <TabsPrimitive.Panel
    {...props}
    className={mergeClassNames(styles.panel, className)}
  />
);
