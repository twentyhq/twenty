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
        [styles['accent-text-primary']]: accent === ChipAccent.TextPrimary,
        [styles['accent-text-secondary']]: accent === ChipAccent.TextSecondary,
        [styles['size-large']]: size === ChipSize.Large,
        [styles['variant-regular']]: variant === ChipVariant.Regular,
        [styles['variant-highlighted']]: variant === ChipVariant.Highlighted,
        [styles['variant-rounded']]: variant === ChipVariant.Rounded,
        [styles['variant-transparent']]: variant === ChipVariant.Transparent,
      })}
      onClick={onClick}
    >
      {leftComponent}
      <div className={styles.label}>
        <OverflowingTextWithTooltip text={label} />
      </div>
      {rightComponent}
    </div>
  );
};
