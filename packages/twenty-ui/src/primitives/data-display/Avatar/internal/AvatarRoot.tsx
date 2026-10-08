import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { isFunction } from '@sniptt/guards';
import { type CSSProperties } from 'react';

import { useTheme } from '@ui/theme';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { stringToThemeColorP3String } from '@ui/utilities';

import styles from '../Avatar.module.scss';
import { type AvatarRootProps } from '../types/AvatarRootProps';

export const AvatarRoot = ({
  name,
  colorSeed = name,
  size = 'md',
  shape = 'square',
  variant = 'soft',
  color,
  backgroundColor,
  borderColor,
  pulsing = false,
  ring = false,
  className,
  style,
  ...props
}: AvatarRootProps) => {
  const theme = useTheme();
  const initial = name?.trim().charAt(0).toUpperCase();
  const fallbackColor = initial
    ? (color ??
      stringToThemeColorP3String({
        string: colorSeed ?? '',
        variant: 12,
        theme,
      }))
    : (color ?? theme.font.color.tertiary);
  const fallbackBackground = initial
    ? (backgroundColor ??
      stringToThemeColorP3String({
        string: colorSeed ?? '',
        variant: variant === 'outline' ? 5 : 4,
        theme,
      }))
    : (backgroundColor ?? theme.background.transparent.light);
  const fallbackBorder =
    borderColor ??
    (initial
      ? stringToThemeColorP3String({
          string: colorSeed ?? '',
          variant: 6,
          theme,
        })
      : undefined);

  return (
    <AvatarPrimitive.Root
      {...props}
      data-size={size}
      data-shape={shape}
      data-pulsing={pulsing || undefined}
      data-ring={ring || undefined}
      className={mergeClassNames(styles.root, className)}
      style={(state) =>
        ({
          '--tw-avatar-color': fallbackColor,
          '--tw-avatar-background':
            state.imageLoadingStatus === 'loaded' ? 'none' : fallbackBackground,
          '--tw-avatar-border':
            variant === 'outline' &&
            state.imageLoadingStatus !== 'loaded' &&
            fallbackBorder
              ? `1px solid ${fallbackBorder}`
              : 'none',
          ...(isFunction(style) ? style(state) : style),
        }) as CSSProperties
      }
    />
  );
};
