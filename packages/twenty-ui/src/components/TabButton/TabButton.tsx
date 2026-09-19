import { clsx } from 'clsx';

import { Button } from '@ui/primitives/input/Button/Button';
import { TabsTabContent } from '@ui/primitives/navigation/Tabs/internal/TabsTabContent';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import tabStyles from '@ui/primitives/navigation/Tabs/Tabs.module.scss';
import styles from './TabButton.module.scss';
import { type TabButtonProps } from './types/TabButtonProps';

export const TabButton = ({
  active = false,
  className,
  children,
  startIcon,
  endIcon,
  badge,
  size = 'sm',
  ...props
}: TabButtonProps) => (
  <Button
    {...props}
    variant="ghost"
    size={size}
    data-active={active || undefined}
    className={mergeClassNames(clsx(tabStyles.tab, styles.button), className)}
  >
    <TabsTabContent startIcon={startIcon} endIcon={endIcon} badge={badge}>
      {children}
    </TabsTabContent>
  </Button>
);
