import { MenuItemLeftContent } from '@ui/components/MenuItem/parts/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemRightContent,
} from '@ui/components/MenuItem/parts/StyledMenuItemBase';
import { Switch } from '@ui/primitives/input/Switch/Switch';
import { type MenuItemSwitchProps } from './types/MenuItemSwitchProps';

import styles from './MenuItemSwitch.module.scss';

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
