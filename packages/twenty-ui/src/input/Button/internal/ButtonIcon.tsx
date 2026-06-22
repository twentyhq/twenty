import { type IconComponent } from '@ui/icon';
import { Loader } from '@ui/feedback';
import { ThemeContext } from '@ui/theme-constants';
import { useContext } from 'react';

import styles from './ButtonIcon.module.scss';

export const ButtonIcon = ({
  Icon,
  isLoading,
}: {
  Icon?: IconComponent;
  isLoading?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={styles.iconWrapper}>
      {isLoading && (
        <div className={styles.loader}>
          <Loader />
        </div>
      )}
      {Icon && (
        <div className={styles.icon} data-loading={isLoading || undefined}>
          <Icon size={theme.icon.size.sm} aria-hidden />
        </div>
      )}
    </div>
  );
};
