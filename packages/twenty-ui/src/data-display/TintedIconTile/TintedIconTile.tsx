import { type IconComponent } from '@ui/icon/types/IconComponent';
import { StyledTintedIconTileContainer } from '@ui/data-display/StyledTintedIconTileContainer/StyledTintedIconTileContainer';
import { getIconTileColorShades } from '@ui/data-display/TintedIconTile/utils/getIconTileColorShades';
import { DEFAULT_THEME_COLOR_FALLBACK } from '@ui/theme';
import { useTheme } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';

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
  const theme = useTheme();
  const style = getIconTileColorShades(color);
  const iconSize = sizeFromProps ?? theme.icon.size.md;
  const iconStroke = strokeFromProps ?? theme.icon.stroke.md;
  const tileDimension = isDefined(sizeFromProps)
    ? `${sizeFromProps}px`
    : undefined;

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
