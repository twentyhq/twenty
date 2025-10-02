import { useTheme } from '@emotion/react';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ReactNode } from 'react';

import styled from '@emotion/styled';
import {
  type IconComponent,
  IconGripVertical,
  OverflowingTextWithTooltip,
} from '@ui/display';
import {
  StyledDraggableItem,
  StyledMenuItemContextualText,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
  StyledRightMenuItemContextualText,
} from './StyledMenuItemBase';

const StyledMainText = styled.div`
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const StyledIconContainer = styled.div`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledMenuItemLabelRight = styled(StyledMenuItemLabel)`
  margin-left: auto;
`;

type MenuItemLeftContentProps = {
  className?: string;
  LeftComponent?: ReactNode;
  LeftIcon: IconComponent | null | undefined;
  withIconContainer?: boolean;
  showGrip?: boolean;
  disabled?: boolean;
  text: ReactNode;
  contextualText?: ReactNode;
  contextualTextPosition?: 'left' | 'right';
};

export const MenuItemLeftContent = ({
  className,
  LeftComponent,
  LeftIcon,
  withIconContainer = false,
  text,
  contextualText,
  contextualTextPosition = 'left',
  showGrip = false,
  disabled = false,
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
              withIconContainer
                ? theme.font.color.tertiary
                : disabled
                  ? theme.font.color.extraLight
                  : theme.font.color.light
            }
          />
        </StyledDraggableItem>
      )}
      {LeftIcon &&
        (withIconContainer ? (
          <StyledIconContainer>
            <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          </StyledIconContainer>
        ) : (
          <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        ))}
      {LeftComponent}
      <StyledMenuItemLabel>
        {isString(text) ? (
          <StyledMainText>
            <OverflowingTextWithTooltip text={text} />
          </StyledMainText>
        ) : (
          text
        )}
        {contextualTextPosition === 'left' && (
          <>
            {isString(contextualText)
              ? isNonEmptyString(contextualText) && (
                  <StyledMenuItemContextualText>
                    <OverflowingTextWithTooltip text={`· ${contextualText}`} />
                  </StyledMenuItemContextualText>
                )
              : contextualText}
          </>
        )}
      </StyledMenuItemLabel>
      {contextualTextPosition === 'right' && (
        <StyledMenuItemLabelRight>
          <StyledRightMenuItemContextualText>
            {isString(contextualText) ? (
              <OverflowingTextWithTooltip text={contextualText} />
            ) : (
              contextualText
            )}
          </StyledRightMenuItemContextualText>
        </StyledMenuItemLabelRight>
      )}
    </StyledMenuItemLeftContent>
  );
};
