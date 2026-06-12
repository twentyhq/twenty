import { type ReactNode, useContext } from 'react';

import {
  StyledMenuItemIconCheck,
  StyledMenuItemLabel,
  StyledMenuItemLabelLight,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { OverflowingTextWithTooltip } from '@ui/display';
import { ThemeContext } from '@ui/theme-constants';
import { StyledMenuItemSelect } from './MenuItemSelect';

import styles from './MenuItemSelectAvatar.module.scss';

type MenuItemSelectAvatarProps = {
  avatar?: ReactNode;
  selected: boolean;
  text: string;
  contextualText?: string;
  className?: string;
  onClick?: (event?: React.MouseEvent) => void;
  disabled?: boolean;
  focused?: boolean;
  testId?: string;
};

export const MenuItemSelectAvatar = ({
  avatar,
  text,
  contextualText,
  selected,
  className,
  onClick,
  disabled,
  focused,
  testId,
}: MenuItemSelectAvatarProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      disabled={disabled}
      focused={focused}
      data-testid={testId}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
    >
      <StyledMenuItemLeftContent>
        {avatar}
        <div className={styles.textContainer}>
          <StyledMenuItemLabel>
            <OverflowingTextWithTooltip text={text} />
          </StyledMenuItemLabel>
          {contextualText && (
            <>
              <StyledMenuItemLabelLight>·</StyledMenuItemLabelLight>
              <StyledMenuItemLabelLight>
                <OverflowingTextWithTooltip text={contextualText} />
              </StyledMenuItemLabelLight>
            </>
          )}
        </div>
      </StyledMenuItemLeftContent>
      {selected && <StyledMenuItemIconCheck size={theme.icon.size.md} />}
    </StyledMenuItemSelect>
  );
};
