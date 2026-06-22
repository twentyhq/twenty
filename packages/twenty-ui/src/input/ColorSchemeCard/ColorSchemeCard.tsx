import React from 'react';

import { clsx } from 'clsx';
import { type AnimationControls } from 'framer-motion';

import { handleClickableElementKeyDown } from '@ui/accessibility/utils/handleClickableElementKeyDown';
import { Checkmark } from '@ui/data-display/Checkmark/Checkmark';
import { type ColorScheme } from '@ui/input/types/ColorScheme';
import { GRAY_SCALE_DARK } from '@ui/theme/constants/GrayScaleDark';
import { GRAY_SCALE_LIGHT } from '@ui/theme/constants/GrayScaleLight';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './ColorSchemeCard.module.scss';

// controls is no longer used since the hover animation is CSS-only now, but it
// stays in the exported type for backward-compatible public API parity.
export type ColorSchemeSegmentProps = {
  variant: ColorScheme;
  controls: AnimationControls;
  className?: string;
} & React.ComponentPropsWithoutRef<'div'>;

const ColorSchemeSegment = ({
  variant,
  style,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: Omit<ColorSchemeSegmentProps, 'controls'>) => {
  const grayScale = variant === 'Dark' ? GRAY_SCALE_DARK : GRAY_SCALE_LIGHT;

  return (
    <div
      className={clsx(styles.colorSchemeBackground, className)}
      style={
        {
          '--color-scheme-card-background': grayScale.gray4,
          '--color-scheme-card-border-color': grayScale.gray5,
          '--color-scheme-card-content-background': grayScale.gray1,
          '--color-scheme-card-content-color': grayScale.gray12,
          ...style,
        } as React.CSSProperties
      }
      role={isDefined(onClick) ? 'button' : undefined}
      tabIndex={isDefined(onClick) ? 0 : undefined}
      aria-label={isDefined(onClick) ? variant : undefined}
      onClick={onClick}
      onKeyDown={handleClickableElementKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.colorSchemeContent}>Aa</div>
    </div>
  );
};

export type ColorSchemeCardProps = {
  variant: ColorScheme;
  selected?: boolean;
} & React.ComponentPropsWithoutRef<'div'>;

export const ColorSchemeCard = ({
  variant,
  selected,
  onClick,
}: ColorSchemeCardProps) => {
  if (variant === 'System') {
    return (
      <div className={styles.container}>
        <div
          className={styles.mixedColorSchemeSegment}
          role={isDefined(onClick) ? 'button' : undefined}
          tabIndex={isDefined(onClick) ? 0 : undefined}
          aria-label={isDefined(onClick) ? variant : undefined}
          onClick={onClick}
          onKeyDown={handleClickableElementKeyDown}
        >
          <ColorSchemeSegment
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            variant="Light"
          />
          <ColorSchemeSegment
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            variant="Dark"
          />
        </div>
        <div
          className={styles.checkmarkContainer}
          data-selected={selected || undefined}
        >
          <Checkmark />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ColorSchemeSegment variant={variant} onClick={onClick} />
      <div
        className={styles.checkmarkContainer}
        data-selected={selected || undefined}
      >
        <Checkmark />
      </div>
    </div>
  );
};
