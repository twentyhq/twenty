import { useTheme } from '@emotion/react';
import { ReactNode } from 'react';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { IconCheck, OverflowingTextWithTooltip } from '@ui/display';
import { StyledMenuItemSelect } from './MenuItemSelect';

type MenuItemSelectAvatarProps = {
  avatar?: ReactNode;
  selected: boolean;
  text: string;
  className?: string;
  onClick?: (event?: React.MouseEvent) => void;
  disabled?: boolean;
  hovered?: boolean;
  testId?: string;
};

export const MenuItemSelectAvatar = ({
  avatar,
  text,
  selected,
  className,
  onClick,
  disabled,
  hovered,
  testId,
}: MenuItemSelectAvatarProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      selected={selected}
      disabled={disabled}
      hovered={hovered}
      data-testid={testId}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
    >
      <StyledMenuItemLeftContent>
        {avatar}
        <StyledMenuItemLabel>
          <OverflowingTextWithTooltip text={text} />
        </StyledMenuItemLabel>
      </StyledMenuItemLeftContent>
      {selected && <IconCheck size={theme.icon.size.md} />}
    </StyledMenuItemSelect>
  );
};
