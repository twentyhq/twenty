import { useContext, type ReactNode } from 'react';

import {
  StyledMenuItemIconCheck,
  StyledMenuItemLabel,
  StyledMenuItemLabelLight,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { styled } from '@linaria/react';
import { OverflowingTextWithTooltip } from '@ui/display';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import { StyledMenuItemSelect } from './MenuItemSelect';

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

const StyledTextContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1 0 0;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
`;

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
        <StyledTextContainer>
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
        </StyledTextContainer>
      </StyledMenuItemLeftContent>
      {selected && <StyledMenuItemIconCheck size={theme.icon.size.md} />}
    </StyledMenuItemSelect>
  );
};
