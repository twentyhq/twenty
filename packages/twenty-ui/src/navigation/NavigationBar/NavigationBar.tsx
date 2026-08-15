import { type IconComponent } from '@ui/icon/types/IconComponent';

import { NavigationBarItem } from '@ui/navigation/NavigationBarItem/NavigationBarItem';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './NavigationBar.module.scss';

type NavigationBarItemDefinition = {
  name: string;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
};

type NavigationBarProps = {
  activeItemName: string;
  isHidden?: boolean;
  items: NavigationBarItemDefinition[];
  detachedItem?: NavigationBarItemDefinition;
};

export const NavigationBar = ({
  activeItemName,
  isHidden = false,
  items,
  detachedItem,
}: NavigationBarProps) => {
  const hasDetachedItem = isDefined(detachedItem);

  return (
    <nav
      className={styles.container}
      data-hidden={isHidden ? '' : undefined}
      data-split={hasDetachedItem ? '' : undefined}
      aria-hidden={isHidden}
    >
      <div className={styles.pill}>
        {items.map(({ Icon, name, label, onClick }) => (
          <NavigationBarItem
            key={name}
            Icon={Icon}
            isActive={activeItemName === name}
            onClick={onClick}
            ariaLabel={label}
          />
        ))}
      </div>
      {hasDetachedItem && (
        <div className={styles.detachedItem}>
          <NavigationBarItem
            Icon={detachedItem.Icon}
            isActive={activeItemName === detachedItem.name}
            onClick={detachedItem.onClick}
            ariaLabel={detachedItem.label}
          />
        </div>
      )}
    </nav>
  );
};
