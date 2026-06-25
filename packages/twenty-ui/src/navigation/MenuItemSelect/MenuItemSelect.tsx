import { isString } from '@sniptt/guards';
import { IconCheck, IconChevronRight, type IconComponent } from '@ui/icon';
import { OverflowingTextWithTooltip } from '@ui/surfaces';
import { type ThemeColor } from '@ui/theme';
import { useTheme } from '@ui/theme-constants';
import { clsx } from 'clsx';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from 'react';
import { MenuItemLeftContent } from '@ui/navigation/MenuItem/parts/MenuItemLeftContent';
import {
  StyledMenuItemLabel,
  StyledMenuItemRightContent,
  StyledRightMenuItemContextualText,
} from '@ui/navigation/MenuItem/parts/StyledMenuItemBase';

import styles from './MenuItemSelect.module.scss';

// The deprecated Linaria styled component forwarded refs and arbitrary
// native props, so the port preserves that contract.
type StyledMenuItemSelectProps = {
  disabled?: boolean;
  focused?: boolean;
  isKeySelected?: boolean;
} & ComponentPropsWithoutRef<'div'>;

export const StyledMenuItemSelect = forwardRef<
  HTMLDivElement,
  StyledMenuItemSelectProps
>(({ disabled, focused, isKeySelected, className, children, ...rest }, ref) => (
  <div
    ref={ref}
    className={clsx(styles.menuItemSelect, className)}
    data-disabled={disabled || undefined}
    data-focused={focused || undefined}
    data-key-selected={isKeySelected || undefined}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  >
    {children}
  </div>
));

StyledMenuItemSelect.displayName = 'StyledMenuItemSelect';

type MenuItemSelectProps = {
  LeftIcon?: IconComponent | null | undefined;
  leftIconColor?: ThemeColor | null;
  withIconContainer?: boolean;
  selected: boolean;
  needIconCheck?: boolean;
  text: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  focused?: boolean;
  hasSubMenu?: boolean;
  contextualText?: ReactNode;
  contextualTextPosition?: 'left' | 'right';
};

export const MenuItemSelect = ({
  LeftIcon,
  leftIconColor,
  withIconContainer = false,
  text,
  selected,
  needIconCheck = true,
  className,
  onClick,
  disabled,
  focused,
  hasSubMenu = false,
  contextualText,
  contextualTextPosition = 'left',
}: MenuItemSelectProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      disabled={disabled}
      focused={focused}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
    >
      <MenuItemLeftContent
        LeftIcon={LeftIcon}
        iconThemeColor={leftIconColor}
        text={text}
        contextualText={
          contextualTextPosition === 'left' ? contextualText : null
        }
        withIconContainer={withIconContainer}
      />
      <StyledMenuItemRightContent>
        {contextualTextPosition === 'right' && (
          <StyledMenuItemLabel>
            {isString(contextualText) ? (
              <StyledRightMenuItemContextualText>
                <OverflowingTextWithTooltip text={contextualText} />
              </StyledRightMenuItemContextualText>
            ) : (
              contextualText
            )}
          </StyledMenuItemLabel>
        )}

        {selected && needIconCheck && <IconCheck size={theme.icon.size.md} />}

        {hasSubMenu && (
          <IconChevronRight
            size={theme.icon.size.sm}
            color={theme.font.color.tertiary}
          />
        )}
      </StyledMenuItemRightContent>
    </StyledMenuItemSelect>
  );
};
