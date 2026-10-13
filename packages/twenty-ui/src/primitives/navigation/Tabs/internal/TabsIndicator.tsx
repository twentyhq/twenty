import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../../internal/tab/Tab.module.scss';
import { type TabsIndicatorProps } from '../types/TabsIndicatorProps';

export const TabsIndicator = ({ className, ...props }: TabsIndicatorProps) => (
  <TabsPrimitive.Indicator
    {...props}
    className={mergeClassNames(styles.indicator, className)}
  />
);
