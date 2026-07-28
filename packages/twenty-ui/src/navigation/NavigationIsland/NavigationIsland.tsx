import { type IconComponent } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

import styles from './NavigationIsland.module.scss';

export type NavigationIslandItem = {
  name: string;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
};

type NavigationIslandProps = {
  activeItemName: string;
  items: NavigationIslandItem[];
};

export const NavigationIsland = ({
  activeItemName,
  items,
}: NavigationIslandProps) => {
  const theme = useTheme();

  return (
    <div className={styles.viewport}>
      <nav className={styles.island}>
        {items.map(({ Icon, name, label, onClick }) => {
          const isActive = activeItemName === name;

          return (
            <button
              key={name}
              type="button"
              className={styles.item}
              data-active={isActive ? '' : undefined}
              aria-label={label}
              aria-pressed={isActive}
              onClick={onClick}
            >
              <Icon
                className={styles.itemIcon}
                size={theme.icon.size.lg}
                aria-hidden
              />
              <span className={styles.itemLabel} aria-hidden>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
