import { clsx } from 'clsx';

import styles from './StyledTintedIconTileContainer.module.scss';

type StyledTintedIconTileContainerProps =
  React.ComponentPropsWithoutRef<'div'> & {
    $backgroundColor?: string;
    $borderColor?: string;
    $dimension?: string;
  };

export const StyledTintedIconTileContainer = ({
  $backgroundColor,
  $borderColor,
  $dimension,
  className,
  style,
  ...rest
}: StyledTintedIconTileContainerProps) => (
  <div
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...rest}
    className={clsx(styles.root, className)}
    style={
      {
        '--tinted-icon-tile-background-color': $backgroundColor,
        '--tinted-icon-tile-border': $borderColor
          ? `1px solid ${$borderColor}`
          : undefined,
        '--tinted-icon-tile-dimension': $dimension,
        ...style,
      } as React.CSSProperties
    }
  />
);
