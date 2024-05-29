import { MouseEvent, ReactNode } from 'react';
import { clsx } from 'clsx';

import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';

import styles from './Chip.module.css';

export enum ChipSize {
  Large = 'large',
  Small = 'small',
}

export enum ChipAccent {
  TextPrimary = 'text-primary',
  TextSecondary = 'text-secondary',
}

export enum ChipVariant {
  Highlighted = 'highlighted',
  Regular = 'regular',
  Transparent = 'transparent',
  Rounded = 'rounded',
}

type ChipProps = {
  size?: ChipSize;
  disabled?: boolean;
  clickable?: boolean;
  label: string;
  maxWidth?: number;
  variant?: ChipVariant;
  accent?: ChipAccent;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  to?: string;
};

export const Chip = ({
  size = ChipSize.Small,
  label,
  disabled = false,
  clickable = true,
  variant = ChipVariant.Regular,
  leftComponent,
  rightComponent,
  accent = ChipAccent.TextPrimary,
  onClick,
}: ChipProps) => {
  return (
    <div
      data-testid="chip"
      className={clsx({
        [styles.chip]: true,
        [styles.clickable]: clickable,
        [styles.disabled]: disabled,
        [styles.accentTextPrimary]: accent === ChipAccent.TextPrimary,
        [styles.accentTextSecondary]: accent === ChipAccent.TextSecondary,
        [styles.sizeLarge]: size === ChipSize.Large,
        [styles.variantRegular]: variant === ChipVariant.Regular,
        [styles.variantHighlighted]: variant === ChipVariant.Highlighted,
        [styles.variantRounded]: variant === ChipVariant.Rounded,
        [styles.variantTransparent]: variant === ChipVariant.Transparent,
      })}
      onClick={onClick}
    >
      {leftComponent}
      <div className={styles.label}>
        <OverflowingTextWithTooltip
          size={size === ChipSize.Large ? 'large' : 'small'}
          text={label}
        />
      </div>
      {rightComponent}
    </div>
  );
};
