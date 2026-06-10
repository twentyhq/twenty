import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ReactNode, useContext } from 'react';

import { styled } from '@linaria/react';
import {
  type IconComponent,
  IconGripVertical,
  OverflowingTextWithTooltip,
} from '@ui/display';
import { type ThemeColor } from '@ui/theme';
import { ThemeContext, themeCssVariables } from '@ui/theme-constants';
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

const StyledMenuItemLabelRight = styled.div`
  display: flex;
  flex-direction: row;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  overflow: hidden;
  white-space: nowrap;
  margin-left: auto;
`;

type MenuItemLeftContentProps = {
  className?: string;
  LeftComponent?: ReactNode;
  LeftIcon: IconComponent | null | undefined;
  iconThemeColor?: ThemeColor | null;
  withIconContainer?: boolean;
  withIconContainerBackground?: boolean;
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
  iconThemeColor,
  withIconContainer = false,
  withIconContainerBackground = true,
  text,
  contextualText,
  contextualTextPosition = 'left',
  gripMode = 'never',
  disabled = false,
}: MenuItemLeftContentProps) => {
  const { theme } = useContext(ThemeContext);

  const gripIconColor = withIconContainer
    ? themeCssVariables.font.color.tertiary
    : disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.light;

  return (
    <StyledMenuItemLeftContent className={className}>
      {gripMode === 'always' &&
        (withIconContainer ? (
          <MenuItemIconBoxContainer hasBackground={withIconContainerBackground}>
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
          iconThemeColor={iconThemeColor}
          withIconContainer={withIconContainer}
          gripIconColor={gripIconColor}
        />
      ) : (
        <MenuItemIcon
          Icon={LeftIcon}
          iconThemeColor={iconThemeColor}
          withContainer={withIconContainer}
          withContainerBackground={withIconContainerBackground}
        />
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
                    <OverflowingTextWithTooltip
                      text={`· ${contextualText}`}
                      tooltipContent={contextualText}
                    />
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
