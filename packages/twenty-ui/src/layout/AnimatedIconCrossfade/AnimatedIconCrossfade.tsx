import { clsx } from 'clsx';

import { type IconComponent } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

import styles from './AnimatedIconCrossfade.module.scss';

type AnimatedIconCrossfadeProps = {
  isActive: boolean;
  ActiveIcon: IconComponent;
  InactiveIcon: IconComponent;
  size?: number;
};

export const AnimatedIconCrossfade = ({
  isActive,
  ActiveIcon,
  InactiveIcon,
  size,
}: AnimatedIconCrossfadeProps) => {
  const theme = useTheme();

  const iconSize = size ?? theme.icon.size.sm;

  return (
    <div
      className={styles.container}
      style={
        {
          '--animated-icon-crossfade-size': `${iconSize}px`,
        } as React.CSSProperties
      }
    >
      <div
        className={clsx(
          styles.layer,
          isActive ? styles.hidden : styles.visible,
        )}
      >
        <InactiveIcon size={iconSize} />
      </div>
      <div
        className={clsx(
          styles.layer,
          isActive ? styles.visible : styles.hidden,
        )}
      >
        <ActiveIcon size={iconSize} />
      </div>
    </div>
  );
};
