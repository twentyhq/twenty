import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ReactNode, useContext } from 'react';

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

import styles from './MenuItemLeftContent.module.scss';

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
          <div className={styles.mainText}>
            <OverflowingTextWithTooltip text={text} />
          </div>
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
        <div className={styles.menuItemLabelRight}>
          <StyledRightMenuItemContextualText>
            {isString(contextualText) ? (
              <OverflowingTextWithTooltip text={contextualText} />
            ) : (
              contextualText
            )}
          </StyledRightMenuItemContextualText>
        </div>
      )}
    </StyledMenuItemLeftContent>
  );
};
