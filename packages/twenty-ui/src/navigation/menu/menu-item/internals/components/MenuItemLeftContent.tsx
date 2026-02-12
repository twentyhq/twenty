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

const StyledIconSwapContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledDefaultIcon = styled.div`
  display: flex;
  transition: opacity ${({ theme }) => theme.animation.duration.instant}s ease;
`;

const StyledHoverIcon = styled.div`
  position: absolute;
  display: flex;
  opacity: 0;
  transition: opacity ${({ theme }) => theme.animation.duration.instant}s ease;
`;

const StyledMenuItemLabelRight = styled(StyledMenuItemLabel)`
  margin-left: auto;
`;

export type GripMode = 'always' | 'onHover' | 'never';

export type MenuItemLeftContentProps = {
  className?: string;
  LeftComponent?: ReactNode;
  LeftIcon: IconComponent | null | undefined;
  withIconContainer?: boolean;
  gripMode?: GripMode;
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
  gripMode = 'never',
  disabled = false,
}: MenuItemLeftContentProps) => {
  const theme = useTheme();

  const gripIconColor = withIconContainer
    ? theme.font.color.tertiary
    : disabled
      ? theme.font.color.extraLight
      : theme.font.color.light;

  const renderGripIcon = () => (
    <IconGripVertical
      size={theme.icon.size.md}
      stroke={theme.icon.stroke.sm}
      color={gripIconColor}
    />
  );

  const renderLeftIcon = () =>
    LeftIcon ? (
      <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
    ) : null;

  const renderIconWithSwap = () => {
    if (!LeftIcon) {
      return null;
    }

    const iconContent = (
      <StyledIconSwapContainer>
        <StyledDefaultIcon className="grip-swap-default-icon">
          {renderLeftIcon()}
        </StyledDefaultIcon>
        <StyledHoverIcon className="grip-swap-hover-icon">
          {renderGripIcon()}
        </StyledHoverIcon>
      </StyledIconSwapContainer>
    );

    return withIconContainer ? (
      <StyledIconContainer>{iconContent}</StyledIconContainer>
    ) : (
      iconContent
    );
  };

  const renderRegularIcon = () => {
    if (!LeftIcon) {
      return null;
    }

    return withIconContainer ? (
      <StyledIconContainer>{renderLeftIcon()}</StyledIconContainer>
    ) : (
      renderLeftIcon()
    );
  };

  return (
    <StyledMenuItemLeftContent className={className}>
      {gripMode === 'always' && (
        <StyledDraggableItem>{renderGripIcon()}</StyledDraggableItem>
      )}
      {gripMode === 'onHover' ? renderIconWithSwap() : renderRegularIcon()}
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
