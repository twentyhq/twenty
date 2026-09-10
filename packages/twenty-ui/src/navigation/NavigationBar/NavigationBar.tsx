import { type IconComponent } from '@ui/icon/types/IconComponent';

import { NavigationBarItem } from '@ui/navigation/NavigationBarItem/NavigationBarItem';

import styles from './NavigationBar.module.scss';

type NavigationBarProps = {
  activeItemName: string;
  isHidden?: boolean;
  items: {
    name: string;
    label: string;
    Icon: IconComponent;
    onClick: () => void;
  }[];
};

export const NavigationBar = ({
  activeItemName,
  isHidden = false,
  items,
}: NavigationBarProps) => {
  return (
    <nav
      className={styles.container}
      data-hidden={isHidden ? '' : undefined}
      aria-hidden={isHidden}
    >
      {items.map(({ Icon, name, label, onClick }) => (
        <NavigationBarItem
          key={name}
          Icon={Icon}
          isActive={activeItemName === name}
          onClick={onClick}
          ariaLabel={label}
        />
      ))}
    </nav>
  );
};
