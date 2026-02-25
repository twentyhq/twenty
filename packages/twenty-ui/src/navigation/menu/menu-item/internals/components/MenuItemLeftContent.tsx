import { useTheme } from '@emotion/react';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ReactNode } from 'react';

import styled from '@emotion/styled';
import {
  type IconComponent,
  IconGripVertical,
  OverflowingTextWithTooltip,
} from '@ui/display';
import { type MenuItemDraggableGripMode } from '../../types/MenuItemDraggableGripMode';
import { MenuItemIcon } from './MenuItemIcon';
import { MenuItemIconBoxContainer } from './MenuItemIconBoxContainer';
import { MenuItemIconWithGripSwap } from './MenuItemIconWithGripSwap';
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

const StyledMenuItemLabelRight = styled(StyledMenuItemLabel)`
  margin-left: auto;
`;

type MenuItemLeftContentProps = {
  className?: string;
  LeftComponent?: ReactNode;
  LeftIcon: IconComponent | null | undefined;
  withIconContainer?: boolean;
  gripMode?: MenuItemDraggableGripMode;
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

  return (
    <StyledMenuItemLeftContent className={className}>
      {gripMode === 'always' &&
        (withIconContainer ? (
          <MenuItemIconBoxContainer>
            <StyledDraggableItem>
              <IconGripVertical
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
                color={gripIconColor}
              />
            </StyledDraggableItem>
          </MenuItemIconBoxContainer>
        ) : (
          <StyledDraggableItem>
            <IconGripVertical
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
              color={gripIconColor}
            />
          </StyledDraggableItem>
        ))}
      {gripMode === 'onHover' ? (
        <MenuItemIconWithGripSwap
          LeftIcon={LeftIcon}
          withIconContainer={withIconContainer}
          gripIconColor={gripIconColor}
        />
      ) : (
        <MenuItemIcon Icon={LeftIcon} withContainer={withIconContainer} />
      )}
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
