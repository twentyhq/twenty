import { MenuItemIconBoxContainer } from '@ui/components/navigation/MenuItem/parts/MenuItemIconBoxContainer';
import { IconGripVertical } from '@ui/icon';
import { useTheme } from '@ui/theme';

import { isDefined } from '@ui/utilities/utils/isDefined';
import { clsx } from 'clsx';
import { type ReactNode } from 'react';

import styles from './MenuItemIconWithGripSwap.module.scss';

export type MenuItemIconWithGripSwapProps = {
  leadingContent?: ReactNode;
  withIconContainer?: boolean;
  withIconContainerBackground?: boolean;
  gripIconColor: string;
};

export const MenuItemIconWithGripSwap = ({
  leadingContent,
  withIconContainer = false,
  withIconContainerBackground = true,
  gripIconColor,
}: MenuItemIconWithGripSwapProps) => {
  const theme = useTheme();

  if (!isDefined(leadingContent)) {
    return null;
  }

  const iconContent = (
    <div className={styles.iconSwapContainer}>
      <div className={clsx(styles.defaultIcon, 'grip-swap-default-icon')}>
        {leadingContent}
      </div>
      <div className={clsx(styles.hoverIcon, 'grip-swap-hover-icon')}>
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={gripIconColor}
        />
      </div>
    </div>
  );

  if (withIconContainer) {
    return (
      <MenuItemIconBoxContainer hasBackground={withIconContainerBackground}>
        {iconContent}
      </MenuItemIconBoxContainer>
    );
  }

  return iconContent;
};
