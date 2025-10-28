import { useTheme } from '@emotion/react';

import {
  StyledMenuItemIconCheck,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { ColorSample, type ColorSampleVariant } from '@ui/display';
import { type ThemeColor } from '@ui/theme';
import { StyledMenuItemSelect } from './MenuItemSelect';

type MenuItemSelectColorProps = {
  selected: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  focused?: boolean;
  color: ThemeColor;
  variant?: ColorSampleVariant;
};

export const colorLabels: Record<ThemeColor, string> = {
  gray: 'Gray',
  mauve: 'Mauve',
  slate: 'Slate',
  sage: 'Sage',
  olive: 'Olive',
  sand: 'Sand',
  tomato: 'Tomato',
  red: 'Red',
  ruby: 'Ruby',
  crimson: 'Crimson',
  pink: 'Pink',
  plum: 'Plum',
  purple: 'Purple',
  violet: 'Violet',
  iris: 'Iris',
  cyan: 'Cyan',
  turquoise: 'Turquoise',
  sky: 'Sky',
  blue: 'Blue',
  jade: 'Jade',
  green: 'Green',
  grass: 'Grass',
  mint: 'Mint',
  lime: 'Lime',
  bronze: 'Bronze',
  gold: 'Gold',
  brown: 'Brown',
  orange: 'Orange',
  amber: 'Amber',
  yellow: 'Yellow',
};

export const MenuItemSelectColor = ({
  color,
  selected,
  className,
  onClick,
  disabled,
  focused,
  variant = 'default',
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
