import { useTheme } from '@emotion/react';
import { styled } from '@linaria/react';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { type IconComponent, OverflowingTextWithTooltip } from '@ui/display';
import { useIsMobile } from '@ui/utilities/responsive/hooks/useIsMobile';
import { type ReactNode } from 'react';
import { MenuItemCommandHotKeys } from './MenuItemCommandHotKeys';

const StyledMenuItemLabelText = styled(StyledMenuItemLabel)`
  color: var(--font-color-primary);
`;

const StyledBigIconContainer = styled.div`
  align-items: center;
  background: var(--background-transparent-light);
  border-radius: var(--border-radius-sm);

  display: flex;

  flex-direction: row;

  padding: var(--spacing-1);
`;

const StyledMenuItemCommandContainer = styled.div<{ isSelected?: boolean }>`
  --horizontal-padding: var(--spacing-1);
  --vertical-padding: var(--spacing-2);
  align-items: center;
  background: ${({ isSelected }) =>
    isSelected ? 'var(--background-transparent-light)' : 'transparent'};
  border-radius: var(--border-radius-sm);
  color: var(--font-color-secondary);
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: var(--font-size-sm);
  gap: var(--spacing-2);
  justify-content: space-between;
  padding: var(--vertical-padding) var(--horizontal-padding);
  position: relative;
  transition: all 150ms ease;
  transition-property: none;
  user-select: none;
  width: 100%;
  box-sizing: border-box;
  height: 40px;
  &:hover {
    background: var(--background-transparent-lighter);
  }
  &[data-selected='true'] {
    background: var(--background-transparent-light);
  }
  &[data-disabled='true'] {
    color: var(--font-color-light);
    cursor: not-allowed;
  }
  svg {
    height: 16px;
    width: 16px;
  }
`;

const StyledDescription = styled.span`
  color: var(--color-font-light);

  &::before {
    content: '·';
    margin: var(--spacing-0) var(--spacing-1);
  }
`;

const StyledTextContainer = styled.div`
  display: flex;
  flex-direction: row;
  max-width: calc(100% - 2 * var(--horizontal-padding));
  overflow: hidden;
`;

export type MenuItemCommandProps = {
  LeftIcon?: IconComponent;
  text: string;
  description?: string;
  hotKeys?: string[];
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
  RightComponent?: ReactNode;
};

export const MenuItemCommand = ({
  LeftIcon,
  text,
  description,
  hotKeys,
  className,
  isSelected,
  onClick,
  RightComponent,
}: MenuItemCommandProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  return (
    <StyledMenuItemCommandContainer
      onClick={onClick}
      className={className}
      isSelected={isSelected}
    >
      <StyledMenuItemLeftContent>
        {LeftIcon && (
          <StyledBigIconContainer>
            <LeftIcon size={theme.icon.size.sm} />
          </StyledBigIconContainer>
        )}
        <StyledTextContainer>
          <StyledMenuItemLabelText>
            <OverflowingTextWithTooltip text={text} />
          </StyledMenuItemLabelText>
          {description && <StyledDescription>{description}</StyledDescription>}
        </StyledTextContainer>
        {RightComponent}
      </StyledMenuItemLeftContent>
      {!isMobile && <MenuItemCommandHotKeys hotKeys={hotKeys} />}
    </StyledMenuItemCommandContainer>
  );
};
