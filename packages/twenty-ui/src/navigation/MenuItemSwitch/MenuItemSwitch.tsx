import { type IconComponent } from '@ui/icon';
import { Switch, type SwitchSize } from '@ui/input';
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
  checked: boolean;
  text: string;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
  size?: SwitchSize;
  disabled?: boolean;
};

export const MenuItemSwitch = ({
  focused,
  LeftIcon,
  withIconContainer = false,
  text,
  checked,
  className,
  onCheckedChange,
  size = 'md',
  disabled = false,
}: MenuItemSwitchProps) => {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange?.(!checked);
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
            checked={checked}
            onCheckedChange={disabled ? undefined : onCheckedChange}
            size={size}
            disabled={disabled}
            aria-label={text}
          />
        </StyledMenuItemRightContent>
      </div>
    </StyledMenuItemBase>
  );
};
