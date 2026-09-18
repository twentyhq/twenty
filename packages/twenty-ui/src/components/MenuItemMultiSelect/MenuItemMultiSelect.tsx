import { MenuItemLeftContent } from '@ui/components/MenuItem/parts/MenuItemLeftContent';
import { MenuItemMultiSelectCheckbox } from '@ui/components/MenuItem/parts/MenuItemMultiSelectCheckbox';
import { StyledMenuItemBase } from '@ui/components/MenuItem/parts/StyledMenuItemBase';
import { type IconComponent } from '@ui/icon';
import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { type ThemeColor } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './MenuItemMultiSelect.module.scss';

type MenuItemMultiSelectProps = {
  color?: ThemeColor;
  LeftIcon?: IconComponent;
  iconThemeColor?: ThemeColor | null;
  selected: boolean;
  isKeySelected?: boolean;
  withIconContainer?: boolean;
  text: string;
  className?: string;
  onSelectChange?: (selected: boolean) => void;
};

export const MenuItemMultiSelect = ({
  color,
  LeftIcon,
  iconThemeColor,
  withIconContainer = false,
  text,
  selected,
  isKeySelected,
  className,
  onSelectChange,
}: MenuItemMultiSelectProps) => {
  const handleOnClick = () => {
    onSelectChange?.(!selected);
  };

  return (
    <StyledMenuItemBase
      isKeySelected={isKeySelected}
      className={className}
      onClick={handleOnClick}
    >
      <div className={styles.leftContentWithCheckboxContainer}>
        <MenuItemMultiSelectCheckbox
          selected={selected}
          onSelectChange={onSelectChange}
          ariaLabel={text}
        />
        {color ? (
          <Tag
            color={color}
            startIcon={isDefined(LeftIcon) ? <LeftIcon /> : undefined}
          >
            {text}
          </Tag>
        ) : (
          <MenuItemLeftContent
            LeftIcon={LeftIcon}
            iconThemeColor={iconThemeColor}
            text={text}
            withIconContainer={withIconContainer}
          />
        )}
      </div>
    </StyledMenuItemBase>
  );
};
