import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Tabs.module.scss';
import { type TabsRootProps } from '../types/TabsRootProps';

export const TabsRoot = ({ className, ...props }: TabsRootProps) => (
  <TabsPrimitive.Root
    {...props}
    className={mergeClassNames(styles.root, className)}
  />
);
