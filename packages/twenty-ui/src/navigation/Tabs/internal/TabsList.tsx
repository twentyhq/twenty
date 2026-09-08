import { useDirection } from '@base-ui/react/direction-provider';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergePartClassName } from '@ui/utilities/internal/mergePartClassName';

import styles from '../Tabs.module.scss';
import { type TabsListProps } from '../types/TabsListProps';
import { focusNextEnabledTab } from './focusNextEnabledTab';

export const TabsList = ({
  className,
  children,
  onKeyDown,
  loopFocus = true,
  ...props
}: TabsListProps) => {
  const direction = useDirection();

  const handleKeyDown: TabsListProps['onKeyDown'] = (event) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      event.preventBaseUIHandler();
      return;
    }

    if (event.baseUIHandlerPrevented) {
      return;
    }

    focusNextEnabledTab({ event, direction, loopFocus });
  };

  return (
    <TabsPrimitive.List
      {...props}
      loopFocus={loopFocus}
      onKeyDown={handleKeyDown}
      className={mergePartClassName(styles.list, className)}
    >
      {children}
      <TabsPrimitive.Indicator className={styles.indicator} />
    </TabsPrimitive.List>
  );
};
