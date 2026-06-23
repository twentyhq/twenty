import { type IconComponent } from '@ui/icon/types/IconComponent';
import { themeCssVariables, useTheme } from '@ui/theme-constants';

import styles from './NavigationBarItem.module.scss';

type NavigationBarItemProps = {
  Icon: IconComponent;
  isActive: boolean;
  onClick: () => void;
  ariaLabel: string;
};

export const NavigationBarItem = ({
  Icon,
  isActive,
  onClick,
  ariaLabel,
}: NavigationBarItemProps) => {
  const theme = useTheme();

  return (
    <button
      type="button"
      className={styles.iconButton}
      data-active={isActive ? '' : undefined}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      onClick={onClick}
    >
      <Icon
        color={themeCssVariables.grayScale.gray10}
        size={theme.icon.size.lg}
        aria-hidden
      />
    </button>
  );
};
