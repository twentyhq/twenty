import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ReactNode } from 'react';

import { MenuItemIcon } from '@ui/components/navigation/MenuItem/parts/MenuItemIcon';
import { MenuItemIconBoxContainer } from '@ui/components/navigation/MenuItem/parts/MenuItemIconBoxContainer';
import { MenuItemIconWithGripSwap } from '@ui/components/navigation/MenuItem/parts/MenuItemIconWithGripSwap';
import {
  StyledDraggableItem,
  StyledMenuItemContextualText,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
  StyledRightMenuItemContextualText,
} from '@ui/components/navigation/MenuItem/parts/StyledMenuItemBase';
import { type MenuItemDraggableGripMode } from '@ui/components/navigation/MenuItem/types/MenuItemDraggableGripMode';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { IconGripVertical, type IconComponent } from '@ui/icon';
import { type ThemeColor, themeCssVariables, useTheme } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

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

const getLeadingContent = ({
  LeftComponent,
  LeftIcon,
  iconThemeColor,
}: Pick<
  MenuItemLeftContentProps,
  'LeftComponent' | 'LeftIcon' | 'iconThemeColor'
>): ReactNode => {
  if (isDefined(LeftComponent)) {
    return LeftComponent;
  }

  if (isDefined(LeftIcon)) {
    return <MenuItemIcon Icon={LeftIcon} iconThemeColor={iconThemeColor} />;
  }

  return undefined;
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
  const theme = useTheme();

  const gripIconColor = withIconContainer
    ? themeCssVariables.font.color.tertiary
    : disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.light;

  const leadingContent = getLeadingContent({
    LeftComponent,
    LeftIcon,
    iconThemeColor,
  });

  const withLeadingContentContainer =
    withIconContainer && !isDefined(iconThemeColor);

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
      {gripMode === 'always' &&
        (withLeadingContentContainer && isDefined(leadingContent) ? (
          <MenuItemIconBoxContainer hasBackground={withIconContainerBackground}>
            {leadingContent}
          </MenuItemIconBoxContainer>
        ) : (
          leadingContent
        ))}
      {gripMode === 'onHover' && (
        <MenuItemIconWithGripSwap
          leadingContent={leadingContent}
          withIconContainer={withLeadingContentContainer}
          withIconContainerBackground={withIconContainerBackground}
          gripIconColor={gripIconColor}
        />
      )}
      {gripMode === 'never' && (
        <>
          <MenuItemIcon
            Icon={LeftIcon}
            iconThemeColor={iconThemeColor}
            withContainer={withIconContainer}
            withContainerBackground={withIconContainerBackground}
          />
          {LeftComponent}
        </>
      )}
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
