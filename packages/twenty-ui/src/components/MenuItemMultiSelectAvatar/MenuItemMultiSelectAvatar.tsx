import { type ReactNode } from 'react';

import { MenuItemMultiSelectCheckbox } from '@ui/components/MenuItem/parts/MenuItemMultiSelectCheckbox';
import {
  StyledMenuItemBase,
  StyledMenuItemLabel,
  StyledMenuItemLabelLight,
  StyledMenuItemLeftContent,
} from '@ui/components/MenuItem/parts/StyledMenuItemBase';
import { OverflowingTextWithTooltip } from '@ui/components/OverflowingTextWithTooltip/OverflowingTextWithTooltip';

import styles from './MenuItemMultiSelectAvatar.module.scss';

type MenuItemMultiSelectAvatarProps = {
  avatar?: ReactNode;
  selected: boolean;
  isKeySelected?: boolean;
  text?: string;
  contextualText?: string;
  className?: string;
  onSelectChange?: (selected: boolean) => void;
};

export const MenuItemMultiSelectAvatar = ({
  avatar,
  text,
  selected,
  contextualText,
  className,
  isKeySelected,
  onSelectChange,
}: MenuItemMultiSelectAvatarProps) => {
  const handleOnClick = () => {
    onSelectChange?.(!selected);
  };

  return (
    <StyledMenuItemBase
      className={className}
      onClick={handleOnClick}
      isKeySelected={isKeySelected}
    >
      <div className={styles.leftContentWithCheckboxContainer}>
        <MenuItemMultiSelectCheckbox
          selected={selected}
          onSelectChange={onSelectChange}
          ariaLabel={text ?? contextualText ?? 'Select item'}
        />
        <StyledMenuItemLeftContent>
          {avatar}
          <div className={styles.textContainer}>
            <StyledMenuItemLabel>
              <OverflowingTextWithTooltip text={text} />
            </StyledMenuItemLabel>
            {contextualText && (
              <>
                <StyledMenuItemLabelLight>·</StyledMenuItemLabelLight>
                <StyledMenuItemLabelLight>
                  <OverflowingTextWithTooltip text={contextualText} />
                </StyledMenuItemLabelLight>
              </>
            )}
          </div>
        </StyledMenuItemLeftContent>
      </div>
    </StyledMenuItemBase>
  );
};
