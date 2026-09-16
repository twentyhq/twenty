import { type IconButtonProps } from './types/IconButtonProps';

import { clsx } from 'clsx';
import React from 'react';

import { useTheme } from '@ui/theme-constants';

import styles from './IconButton.module.scss';

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      Icon,
      variant = 'primary',
      size = 'medium',
      accent = 'default',
      position = 'standalone',
      disabled = false,
      focus = false,
      dataTestId,
      ariaLabel,
      'aria-label': nativeAriaLabel,
      onClick,
      to,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const theme = useTheme();
    const resolvedAriaLabel = ariaLabel ?? nativeAriaLabel;

    return (
      <button
        {...buttonProps}
        ref={ref}
        data-testid={dataTestId}
        className={clsx(styles.button, styles[size], className)}
        data-variant={variant}
        data-accent={accent}
        data-position={position}
        data-disabled={disabled || undefined}
        data-focus={focus || undefined}
        disabled={disabled}
        onClick={onClick}
        aria-label={resolvedAriaLabel}
        // The legacy Linaria button never navigated: `to` was simply forwarded
        // to the DOM as an inert attribute. Keep forwarding it for DOM parity.
        {...{ to }}
      >
        {Icon ? (
          <Icon size={theme.icon.size.md} aria-hidden={!!resolvedAriaLabel} />
        ) : null}
        {children}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
