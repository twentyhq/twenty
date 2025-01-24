import { useTheme } from '@emotion/react';
import { isString } from '@sniptt/guards';
import { ReactNode } from 'react';

import styled from '@emotion/styled';
import {
  IconComponent,
  IconGripVertical,
  OverflowingTextWithTooltip,
} from '@ui/display';
import {
  StyledDraggableItem,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from './StyledMenuItemBase';

const StyledMainText = styled.div`
  flex-shrink: 0;
`;

const StyledContextualText = styled.div`
  color: ${({ theme }) => theme.color.gray35};
  font-family: inherit;

  font-size: inherit;
  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;

  text-decoration: inherit;
  text-overflow: ellipsis;

  white-space: nowrap;

  padding-left: ${({ theme }) => theme.spacing(1)};
  flex-shrink: 1;
`;

type MenuItemLeftContentProps = {
  className?: string;
  LeftIcon: IconComponent | null | undefined;
  showGrip?: boolean;
  isDisabled?: boolean;
  text: ReactNode;
  contextualText?: ReactNode;
};

export const MenuItemLeftContent = ({
  className,
  LeftIcon,
  text,
  contextualText,
  showGrip = false,
  isDisabled = false,
}: MenuItemLeftContentProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemLeftContent className={className}>
      {showGrip && (
        <StyledDraggableItem>
          <IconGripVertical
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={
              isDisabled ? theme.font.color.extraLight : theme.font.color.light
            }
          />
        </StyledDraggableItem>
      )}
      {LeftIcon && (
        <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      )}
      <StyledMenuItemLabel>
        {isString(text) ? (
          <StyledMainText>
            <OverflowingTextWithTooltip text={text} />
          </StyledMainText>
        ) : (
          text
        )}
        {isString(contextualText) ? (
          <StyledContextualText>{`· ${contextualText}`}</StyledContextualText>
        ) : (
          contextualText
        )}
      </StyledMenuItemLabel>
    </StyledMenuItemLeftContent>
  );
};
