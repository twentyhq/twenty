import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergeFieldPartClassName } from '@ui/input/Field/internal/mergeFieldPartClassName';

import styles from '../Tabs.module.scss';
import { type TabsPanelProps } from '../types/TabsPanelProps';

export const TabsPanel = ({ className, ...props }: TabsPanelProps) => (
  <TabsPrimitive.Panel
    {...props}
    className={mergeFieldPartClassName(styles.panel, className)}
  />
);
