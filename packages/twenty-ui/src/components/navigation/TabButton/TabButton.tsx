import { clsx } from 'clsx';
import { useContext } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { ButtonGroupContext } from '@ui/primitives/input/ButtonGroup/internal/ButtonGroupContext';
import { TabsTabContent } from '@ui/primitives/navigation/internal/tab/TabsTabContent';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import tabStyles from '@ui/primitives/navigation/internal/tab/Tab.module.scss';
import styles from './TabButton.module.scss';
import { type TabButtonProps } from './types/TabButtonProps';

export const TabButton = ({
  active = false,
  className,
  children,
  startIcon,
  endIcon,
  badge,
  size,
  ...props
}: TabButtonProps) => {
  const buttonGroup = useContext(ButtonGroupContext);
  const resolvedSize = size ?? buttonGroup?.size ?? 'sm';

  return (
    <Button
      {...props}
      variant="ghost"
      size={resolvedSize}
      data-active={active || undefined}
      className={mergeClassNames(clsx(tabStyles.tab, styles.button), className)}
    >
      <TabsTabContent startIcon={startIcon} endIcon={endIcon} badge={badge}>
        {children}
      </TabsTabContent>
    </Button>
  );
};
