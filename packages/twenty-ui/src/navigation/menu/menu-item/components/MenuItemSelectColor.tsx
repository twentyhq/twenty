import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';

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

const useColorLabels = (): Record<ThemeColor, string> => {
  const { t } = useLingui();
  return {
    gray: t`Gray`,
    tomato: t`Tomato`,
    red: t`Red`,
    ruby: t`Ruby`,
    crimson: t`Crimson`,
    pink: t`Pink`,
    plum: t`Plum`,
    purple: t`Purple`,
    violet: t`Violet`,
    iris: t`Iris`,
    cyan: t`Cyan`,
    turquoise: t`Turquoise`,
    sky: t`Sky`,
    blue: t`Blue`,
    jade: t`Jade`,
    green: t`Green`,
    grass: t`Grass`,
    mint: t`Mint`,
    lime: t`Lime`,
    bronze: t`Bronze`,
    gold: t`Gold`,
    brown: t`Brown`,
    orange: t`Orange`,
    amber: t`Amber`,
    yellow: t`Yellow`,
  };
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
  const colorLabels = useColorLabels();

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
