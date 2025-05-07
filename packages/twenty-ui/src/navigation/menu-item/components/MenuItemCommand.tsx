import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { IconComponent, OverflowingTextWithTooltip } from '@ui/display';
import { useIsMobile } from '@ui/utilities/responsive/hooks/useIsMobile';
import { ReactNode } from 'react';
import { MenuItemCommandHotKeys } from './MenuItemCommandHotKeys';

const StyledMenuItemLabelText = styled(StyledMenuItemLabel)`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledBigIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  display: flex;

  flex-direction: row;

  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledMenuItemCommandContainer = styled.div<{ isSelected?: boolean }>`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
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
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
  &[data-selected='true'] {
    background: ${({ theme }) => theme.background.transparent.light};
  }
  &[data-disabled='true'] {
    color: ${({ theme }) => theme.font.color.light};
    cursor: not-allowed;
  }
  svg {
    height: 16px;
    width: 16px;
  }
`;

const StyledDescription = styled.span`
  color: ${({ theme }) => theme.font.color.light};

  &::before {
    content: '·';
    margin: ${({ theme }) => theme.spacing(0, 1)};
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
