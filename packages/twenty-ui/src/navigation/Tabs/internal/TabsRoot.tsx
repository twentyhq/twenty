import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergePartClassName } from '@ui/utilities/internal/mergePartClassName';

import styles from '../Tabs.module.scss';
import { type TabsRootProps } from '../types/TabsRootProps';

export const TabsRoot = ({ className, ...props }: TabsRootProps) => (
  <TabsPrimitive.Root
    {...props}
    className={mergePartClassName(styles.root, className)}
  />
);
