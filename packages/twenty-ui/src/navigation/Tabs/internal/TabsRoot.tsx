import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergeFieldPartClassName } from '@ui/input/Field/internal/mergeFieldPartClassName';

import styles from '../Tabs.module.scss';
import { type TabsRootProps } from '../types/TabsRootProps';

export const TabsRoot = ({ className, ...props }: TabsRootProps) => (
  <TabsPrimitive.Root
    {...props}
    className={mergeFieldPartClassName(styles.root, className)}
  />
);
