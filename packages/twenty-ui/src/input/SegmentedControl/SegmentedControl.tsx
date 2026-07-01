import { type ReactNode } from 'react';

import { type IconComponent } from '@ui/icon';
import { useTheme } from '@ui/theme-constants';

import { clsx } from 'clsx';

import styles from './SegmentedControl.module.scss';

export type SegmentedControlOption<Value extends string> = {
  Icon?: IconComponent;
  ariaLabel?: string;
  disabled?: boolean;
  label?: ReactNode;
  value: Value;
};

export type SegmentedControlProps<Value extends string> = {
  ariaLabel: string;
  className?: string;
  onChange: (value: Value) => void;
  options: SegmentedControlOption<Value>[];
  role?: 'group' | 'tablist';
  value: Value;
};

export const SegmentedControl = <Value extends string>({
  ariaLabel,
  className,
  onChange,
  options,
  role = 'group',
  value,
}: SegmentedControlProps<Value>) => {
  const theme = useTheme();
  const isTabList = role === 'tablist';

  return (
    <div
      className={clsx(styles.container, className)}
      role={role}
      aria-label={ariaLabel}
    >
      {options.map(
        ({
          Icon,
          ariaLabel: itemAriaLabel,
          disabled,
          label,
          value: optionValue,
        }) => {
          const isSelected = optionValue === value;
          const inferredAriaLabel =
            itemAriaLabel ?? (typeof label === 'string' ? label : undefined);
          const hasLabel = label !== undefined && label !== null;

          return (
            <button
              aria-label={inferredAriaLabel}
              aria-pressed={!isTabList ? isSelected : undefined}
              aria-selected={isTabList ? isSelected : undefined}
              className={clsx(styles.item, !hasLabel && styles.iconOnly)}
              data-active={isSelected || undefined}
              disabled={disabled}
              key={optionValue}
              onClick={() => onChange(optionValue)}
              role={isTabList ? 'tab' : undefined}
              tabIndex={isTabList ? (isSelected ? 0 : -1) : undefined}
              type="button"
            >
              {Icon && (
                <span className={styles.icon}>
                  <Icon
                    aria-hidden={hasLabel || inferredAriaLabel !== undefined}
                    color={
                      isSelected
                        ? theme.font.color.primary
                        : theme.font.color.tertiary
                    }
                    size={theme.icon.size.md}
                  />
                </span>
              )}
              {hasLabel && <span className={styles.label}>{label}</span>}
            </button>
          );
        },
      )}
    </div>
  );
};
