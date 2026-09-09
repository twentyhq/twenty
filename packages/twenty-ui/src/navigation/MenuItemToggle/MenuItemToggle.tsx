import { type IconComponent } from '@ui/icon';
import { Switch } from '@ui/input';
import { MenuItemLeftContent } from '@ui/navigation/MenuItem/parts/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemRightContent,
} from '@ui/navigation/MenuItem/parts/StyledMenuItemBase';

import styles from './MenuItemToggle.module.scss';

export type MenuItemToggleProps = {
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

export const MenuItemToggle = ({
  focused,
  LeftIcon,
  withIconContainer = false,
  text,
  toggled,
  className,
  onToggleChange,
  toggleSize,
  disabled = false,
}: MenuItemToggleProps) => {
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
      <div className={styles.toggleContainer}>
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
