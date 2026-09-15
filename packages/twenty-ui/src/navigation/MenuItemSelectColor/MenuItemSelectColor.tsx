import {
  StyledMenuItemIconCheck,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '@ui/navigation/MenuItem/parts/StyledMenuItemBase';

import { ColorSample, type ColorSampleVariant } from '@ui/data-display';
import { type ThemeColor } from '@ui/theme';
import { useTheme } from '@ui/theme-constants';
import {
  DEFAULT_COLOR_LABELS,
  type ColorLabels,
} from '@ui/navigation/MenuItem/constants/DefaultColorLabels';
import { StyledMenuItemSelect } from '@ui/navigation/MenuItemSelect/MenuItemSelect';

type MenuItemSelectColorProps = {
  selected: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  focused?: boolean;
  color: ThemeColor;
  variant?: ColorSampleVariant;
  colorLabels?: ColorLabels;
};

export const MenuItemSelectColor = ({
  color,
  selected,
  className,
  onClick,
  disabled,
  focused,
  variant = 'default',
  colorLabels = DEFAULT_COLOR_LABELS,
}: MenuItemSelectColorProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      disabled={disabled}
      focused={focused}
    >
      <StyledMenuItemLeftContent>
        <ColorSample colorName={color} variant={variant} />
        <StyledMenuItemLabel>{colorLabels[color]}</StyledMenuItemLabel>
      </StyledMenuItemLeftContent>
      {selected && <StyledMenuItemIconCheck size={theme.icon.size.md} />}
    </StyledMenuItemSelect>
  );
};
