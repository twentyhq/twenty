import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { clsx } from 'clsx';
import * as React from 'react';

import { IconCheck, IconMinus } from '@ui/icon/components/TablerIcons';

import styles from './Checkbox.module.scss';

export enum CheckboxVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

export enum CheckboxShape {
  Squared = 'squared',
  Rounded = 'rounded',
}

export enum CheckboxSize {
  Large = 'large',
  Small = 'small',
}

export enum CheckboxAccent {
  Blue = 'blue',
  Orange = 'orange',
}

type CheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  hoverable?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (value: boolean) => void;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  shape?: CheckboxShape;
  className?: string;
  disabled?: boolean;
  accent?: CheckboxAccent;
  'aria-label'?: string;
};

export const Checkbox = ({
  checked,
  onChange,
  onCheckedChange,
  indeterminate,
  variant = CheckboxVariant.Primary,
  size = CheckboxSize.Small,
  shape = CheckboxShape.Squared,
  hoverable = true,
  className,
  disabled = false,
  accent = CheckboxAccent.Blue,
  'aria-label': ariaLabel,
}: CheckboxProps) => {
  const [isInternalChecked, setIsInternalChecked] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    setIsInternalChecked(checked ?? false);
  }, [checked]);

  return (
    <CheckboxPrimitive.Root
      checked={isInternalChecked}
      indeterminate={indeterminate}
      disabled={disabled}
      name="styled-checkbox"
      aria-label={ariaLabel}
      data-testid="input-checkbox"
      onCheckedChange={(value, eventDetails) => {
        onChange?.(
          eventDetails.event as unknown as React.ChangeEvent<HTMLInputElement>,
        );
        onCheckedChange?.(value);
        setIsInternalChecked(value);
      }}
      className={clsx(
        styles.root,
        styles[variant],
        styles[size],
        styles[shape],
        styles[accent],
        hoverable && styles.hoverable,
        className,
      )}
    >
      <span className={styles.box}>
        <CheckboxPrimitive.Indicator className={styles.indicator}>
          {indeterminate ? <IconMinus /> : <IconCheck />}
        </CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  );
};
