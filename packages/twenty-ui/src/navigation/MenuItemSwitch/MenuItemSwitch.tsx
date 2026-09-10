import { type IconComponent } from '@ui/icon';
import { Switch } from '@ui/input';
import { MenuItemLeftContent } from '@ui/navigation/MenuItem/parts/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemRightContent,
} from '@ui/navigation/MenuItem/parts/StyledMenuItemBase';

import styles from './MenuItemSwitch.module.scss';

export type MenuItemSwitchProps = {
  focused?: boolean;
  LeftIcon?: IconComponent;
  withIconContainer?: boolean;
  toggled: boolean;
  text: string;
  className?: string;
  onToggleChange?: (toggled: boolean) => void;
  toggleSize?: 'small' | 'medium';
  disabled?: boolean;
};

export const MenuItemSwitch = ({
  focused,
  LeftIcon,
  withIconContainer = false,
  text,
  toggled,
  className,
  onToggleChange,
  toggleSize,
  disabled = false,
}: MenuItemSwitchProps) => {
  const handleClick = () => {
    if (!disabled) {
      onToggleChange?.(!toggled);
    }
  };

  return (
    <StyledMenuItemBase
      className={className}
      focused={focused}
      disabled={disabled}
      onClick={handleClick}
    >
      <div className={styles.switchContainer}>
        <MenuItemLeftContent
          LeftIcon={LeftIcon}
          text={text}
          withIconContainer={withIconContainer}
          disabled={disabled}
        />
        <StyledMenuItemRightContent onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={toggled}
            onCheckedChange={disabled ? undefined : onToggleChange}
            size={toggleSize === 'small' ? 'sm' : 'md'}
            disabled={disabled}
            aria-label={text}
          />
        </StyledMenuItemRightContent>
      </div>
    </StyledMenuItemBase>
  );
};
