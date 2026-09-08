import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergePartClassName } from '@ui/utilities/internal/mergePartClassName';

import styles from '../Tabs.module.scss';
import { type TabsPanelProps } from '../types/TabsPanelProps';

export const TabsPanel = ({ className, ...props }: TabsPanelProps) => (
  <TabsPrimitive.Panel
    {...props}
    className={mergePartClassName(styles.panel, className)}
  />
);
