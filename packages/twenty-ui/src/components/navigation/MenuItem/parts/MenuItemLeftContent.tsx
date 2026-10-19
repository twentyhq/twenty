import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ReactNode } from 'react';

import { MenuItemIcon } from '@ui/components/navigation/MenuItem/parts/MenuItemIcon';
import {
  StyledMenuItemContextualText,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
  StyledRightMenuItemContextualText,
} from '@ui/components/navigation/MenuItem/parts/StyledMenuItemBase';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { type IconComponent } from '@ui/icon';
import { type ThemeColor } from '@ui/theme';

import styles from './MenuItemLeftContent.module.scss';

type MenuItemLeftContentProps = {
  className?: string;
  LeftComponent?: ReactNode;
  LeftIcon: IconComponent | null | undefined;
  iconThemeColor?: ThemeColor | null;
  withIconContainer?: boolean;
  withIconContainerBackground?: boolean;
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
}: MenuItemLeftContentProps) => {
  return (
    <StyledMenuItemLeftContent className={className}>
      <MenuItemIcon
        Icon={LeftIcon}
        iconThemeColor={iconThemeColor}
        withContainer={withIconContainer}
        withContainerBackground={withIconContainerBackground}
      />
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
