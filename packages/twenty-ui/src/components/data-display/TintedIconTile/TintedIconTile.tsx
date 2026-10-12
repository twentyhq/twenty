import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { getIconTileColorShades } from '@ui/components/data-display/TintedIconTile/utils/getIconTileColorShades';
import { DEFAULT_THEME_COLOR_FALLBACK } from '@ui/theme';

import styles from './TintedIconTile.module.scss';
import { type TintedIconTileProps } from './types/TintedIconTileProps';

export const TintedIconTile = ({
  icon,
  color = DEFAULT_THEME_COLOR_FALLBACK,
  className,
  style,
  render,
  ref,
  ...props
}: TintedIconTileProps) => {
  const colorShades = getIconTileColorShades(color);

  return useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.root, className),
      style: {
        backgroundColor: colorShades.backgroundColor,
        color: colorShades.iconColor,
        ...style,
      },
      children: <span aria-hidden="true">{icon}</span>,
    },
  });
};
