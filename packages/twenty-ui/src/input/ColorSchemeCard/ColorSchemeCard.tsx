import React from 'react';

import { clsx } from 'clsx';

import { handleClickableElementKeyDown } from '@ui/accessibility/utils/handleClickableElementKeyDown';
import { Checkmark } from '@ui/data-display/Checkmark/Checkmark';
import { type ColorScheme } from '@ui/input/types/ColorScheme';
import { GRAY_SCALE_DARK } from '@ui/theme/constants/GrayScaleDark';
import { GRAY_SCALE_LIGHT } from '@ui/theme/constants/GrayScaleLight';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './ColorSchemeCard.module.scss';

export type ColorSchemeSegmentProps = {
  variant: ColorScheme;
  className?: string;
} & React.ComponentPropsWithoutRef<'div'>;

const ColorSchemeSegment = ({
  variant,
  style,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ColorSchemeSegmentProps) => {
  const grayScale = variant === 'Dark' ? GRAY_SCALE_DARK : GRAY_SCALE_LIGHT;

  const segmentClassName = clsx(styles.colorSchemeBackground, className);
  const segmentStyle = {
    '--color-scheme-card-background': grayScale.gray4,
    '--color-scheme-card-border-color': grayScale.gray5,
    '--color-scheme-card-content-background': grayScale.gray1,
    '--color-scheme-card-content-color': grayScale.gray12,
    ...style,
  } as React.CSSProperties;
  const segmentContent = <div className={styles.colorSchemeContent}>Aa</div>;

  if (isDefined(onClick)) {
    return (
      <div
        className={segmentClassName}
        style={segmentStyle}
        role="button"
        tabIndex={0}
        aria-label={variant}
        onClick={onClick}
        onKeyDown={handleClickableElementKeyDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {segmentContent}
      </div>
    );
  }

  return (
    <div
      className={segmentClassName}
      style={segmentStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {segmentContent}
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
  className,
}: ColorSchemeCardProps) => {
  const mixedSegments = (
    <>
      <ColorSchemeSegment
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        variant="Light"
      />
      <ColorSchemeSegment
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        variant="Dark"
      />
    </>
  );

  if (variant === 'System') {
    return (
      <div className={clsx(styles.container, className)}>
        {isDefined(onClick) ? (
          <div
            className={styles.mixedColorSchemeSegment}
            role="button"
            tabIndex={0}
            aria-label={variant}
            onClick={onClick}
            onKeyDown={handleClickableElementKeyDown}
          >
            {mixedSegments}
          </div>
        ) : (
          <div className={styles.mixedColorSchemeSegment}>{mixedSegments}</div>
        )}
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
    <div className={clsx(styles.container, className)}>
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
