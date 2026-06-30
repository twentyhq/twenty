import { type IconComponent } from '@ui/icon/types/IconComponent';

import { NavigationBarItem } from '@ui/navigation/NavigationBarItem/NavigationBarItem';

import styles from './NavigationBar.module.scss';

type NavigationBarProps = {
  activeItemName: string;
  items: {
    name: string;
    label: string;
    Icon: IconComponent;
    onClick: () => void;
  }[];
};

export const NavigationBar = ({
  activeItemName,
  items,
}: NavigationBarProps) => {
  return (
    <div className={styles.container}>
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
  );
};
