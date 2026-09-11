import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { type CSSProperties } from 'react';

import { useTheme } from '@ui/theme-constants';
import { stringToThemeColorP3String } from '@ui/utilities';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './Avatar.module.scss';
import { type AvatarProps } from './types/AvatarProps';

export const Avatar = ({
  src,
  name,
  colorSeed = name,
  size = 'md',
  shape = 'square',
  variant = 'soft',
  icon,
  color,
  backgroundColor,
  borderColor,
  pulsing = false,
  disabled = false,
  nativeButton = true,
  onClick,
  className,
  style,
  render,
  'aria-label': ariaLabel,
  ...props
}: AvatarProps) => {
  const theme = useTheme();
  const initial = name?.trim().charAt(0).toUpperCase();
  const fallbackColor = initial
    ? (color ??
      stringToThemeColorP3String({
        string: colorSeed ?? '',
        variant: 12,
        theme,
      }))
    : theme.font.color.tertiary;
  const fallbackBackground = initial
    ? (backgroundColor ??
      stringToThemeColorP3String({
        string: colorSeed ?? '',
        variant: variant === 'outline' ? 5 : 4,
        theme,
      }))
    : theme.background.transparent.light;
  const fallbackBorder =
    borderColor ??
    (initial
      ? stringToThemeColorP3String({
          string: colorSeed ?? '',
          variant: 6,
          theme,
        })
      : undefined);
  const isInteractive = isDefined(onClick);
  const hasIcon = isDefined(icon) && typeof icon !== 'boolean' && icon !== '';

  return (
    <AvatarPrimitive.Root
      {...props}
      onClick={onClick}
      aria-label={
        ariaLabel ?? (isInteractive ? name?.trim() || 'Avatar' : undefined)
      }
      data-size={size}
      data-shape={shape}
      data-pulsing={pulsing || undefined}
      data-disabled={disabled || undefined}
      data-clickable={isInteractive || undefined}
      className={mergeClassNames(styles.root, className)}
      style={(state) =>
        ({
          '--tw-avatar-color': fallbackColor,
          '--tw-avatar-background': hasIcon
            ? 'inherit'
            : state.imageLoadingStatus === 'loaded'
              ? 'none'
              : fallbackBackground,
          '--tw-avatar-border':
            variant === 'outline' &&
            state.imageLoadingStatus !== 'loaded' &&
            fallbackBorder
              ? `1px solid ${fallbackBorder}`
              : 'none',
          ...(typeof style === 'function' ? style(state) : style),
        }) as CSSProperties
      }
      render={
        isInteractive
          ? (rootProps, state) => (
              <ButtonPrimitive
                {...rootProps}
                disabled={disabled}
                nativeButton={nativeButton}
                render={
                  typeof render === 'function'
                    ? (buttonProps) => render(buttonProps, state)
                    : render
                }
              />
            )
          : render
      }
    >
      {hasIcon ? (
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      ) : (
        <>
          <AvatarPrimitive.Image
            src={src ?? undefined}
            alt={name ?? ''}
            className={styles.image}
          />
          <AvatarPrimitive.Fallback className={styles.fallback}>
            {initial || '-'}
          </AvatarPrimitive.Fallback>
        </>
      )}
    </AvatarPrimitive.Root>
  );
};
