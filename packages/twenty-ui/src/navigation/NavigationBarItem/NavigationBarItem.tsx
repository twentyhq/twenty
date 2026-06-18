import { useContext } from 'react';

import { type IconComponent } from '@ui/icon/types/IconComponent';
import { ThemeContext, themeCssVariables } from '@ui/theme-constants';

import styles from './NavigationBarItem.module.scss';

type NavigationBarItemProps = {
  Icon: IconComponent;
  isActive: boolean;
  onClick: () => void;
};

export const NavigationBarItem = ({
  Icon,
  isActive,
  onClick,
}: NavigationBarItemProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={styles.iconButton}
      data-active={isActive ? '' : undefined}
      onClick={onClick}
    >
      <Icon
        color={themeCssVariables.grayScale.gray10}
        size={theme.icon.size.lg}
      />
    </div>
  );
};
