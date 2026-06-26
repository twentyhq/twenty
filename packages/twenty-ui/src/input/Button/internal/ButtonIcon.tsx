import { type IconComponent } from '@ui/icon';
import { Loader } from '@ui/feedback';
import { useTheme } from '@ui/theme-constants';

import styles from './ButtonIcon.module.scss';

export const ButtonIcon = ({
  Icon,
  isLoading,
}: {
  Icon?: IconComponent;
  isLoading?: boolean;
}) => {
  const theme = useTheme();

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
