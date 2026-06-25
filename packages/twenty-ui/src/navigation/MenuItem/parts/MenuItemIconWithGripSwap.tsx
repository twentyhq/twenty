import { TintedIconTile } from '@ui/data-display';
import { type IconComponent, IconGripVertical } from '@ui/icon';
import { type ThemeColor } from '@ui/theme';
import { useTheme } from '@ui/theme-constants';
import { clsx } from 'clsx';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { MenuItemIconBoxContainer } from '@ui/navigation/MenuItem/parts/MenuItemIconBoxContainer';

import styles from './MenuItemIconWithGripSwap.module.scss';

export type MenuItemIconWithGripSwapProps = {
  LeftIcon: IconComponent | null | undefined;
  iconThemeColor?: ThemeColor | null;
  withIconContainer?: boolean;
  gripIconColor: string;
};

export const MenuItemIconWithGripSwap = ({
  LeftIcon,
  iconThemeColor,
  withIconContainer = false,
  gripIconColor,
}: MenuItemIconWithGripSwapProps) => {
  const theme = useTheme();

  if (!LeftIcon) {
    return null;
  }

  const iconContent = (
    <div className={styles.iconSwapContainer}>
      <div className={clsx(styles.defaultIcon, 'grip-swap-default-icon')}>
        {isDefined(iconThemeColor) ? (
          <TintedIconTile
            Icon={LeftIcon}
            color={iconThemeColor}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        ) : (
          <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
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

  if (withIconContainer && !isDefined(iconThemeColor)) {
    return <MenuItemIconBoxContainer>{iconContent}</MenuItemIconBoxContainer>;
  }

  return iconContent;
};
