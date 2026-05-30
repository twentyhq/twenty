import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { StyledTintedIconTileContainer } from '@ui/display/tinted-icon-tile/components/StyledTintedIconTileContainer';
import { getIconTileColorShades } from '@ui/display/tinted-icon-tile/utils/getIconTileColorShades';
import { DEFAULT_THEME_COLOR_FALLBACK } from '@ui/theme';
import { ThemeContext } from '@ui/theme-constants';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type TintedIconTileProps = {
  Icon: IconComponent;
  color?: string | null;
  size?: number;
  stroke?: number;
};

export const TintedIconTile = ({
  Icon,
  color = DEFAULT_THEME_COLOR_FALLBACK,
  size: sizeFromProps,
  stroke: strokeFromProps,
}: TintedIconTileProps) => {
  const { theme } = useContext(ThemeContext);
  const style = getIconTileColorShades(color);
  const iconSize = sizeFromProps ?? theme.icon.size.md;
  const iconStroke = strokeFromProps ?? theme.icon.stroke.md;
  // When the caller doesn't specify a tile size, give the tile 4px of
  // breathing room around the icon on each side instead of letting the
  // icon fill the tile edge-to-edge. Callers that pass `size` still get a
  // tile sized exactly to that value (back-compat with explicit sizing).
  const tileDimension = isDefined(sizeFromProps)
    ? `${sizeFromProps}px`
    : `${iconSize + 8}px`;

  return (
    <StyledTintedIconTileContainer
      $backgroundColor={style.backgroundColor}
      $borderColor={style.borderColor}
      $dimension={tileDimension}
    >
      <Icon size={iconSize} stroke={iconStroke} color={style.iconColor} />
    </StyledTintedIconTileContainer>
  );
};
