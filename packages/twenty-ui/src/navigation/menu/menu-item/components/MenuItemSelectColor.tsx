import { useContext } from 'react';

import {
  StyledMenuItemIconCheck,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { ColorSample, type ColorSampleVariant } from '@ui/display';
import { type ThemeColor, ThemeContext } from '@ui/theme';
import {
  DEFAULT_COLOR_LABELS,
  type ColorLabels,
} from '../constants/DefaultColorLabels';
import { StyledMenuItemSelect } from './MenuItemSelect';

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
  const { theme } = useContext(ThemeContext);

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
