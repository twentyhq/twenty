import { type KeyboardEvent, type ReactNode, useRef } from 'react';

import { type IconComponent } from '@ui/icon';
import { useTheme } from '@ui/theme-constants';

import { clsx } from 'clsx';

import styles from './SegmentedControl.module.scss';

type SegmentedControlOptionBase<Value extends string> = {
  disabled?: boolean;
  value: Value;
};

type SegmentedControlOptionWithLabel<Value extends string> =
  SegmentedControlOptionBase<Value> & {
    Icon?: IconComponent;
    ariaLabel?: string;
    label: NonNullable<ReactNode>;
  };

type SegmentedControlOptionIconOnly<Value extends string> =
  SegmentedControlOptionBase<Value> & {
    Icon: IconComponent;
    ariaLabel: string;
    label?: never;
  };

export type SegmentedControlOption<Value extends string> =
  | SegmentedControlOptionWithLabel<Value>
  | SegmentedControlOptionIconOnly<Value>;

type SegmentedControlOptionButtonProps<Value extends string> = {
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
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusAndSelectOption = (optionValue: Value) => {
    onChange(optionValue);

    const optionIndex = options.findIndex(
      (option) => option.value === optionValue,
    );

    buttonRefs.current[optionIndex]?.focus();
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    optionValue: Value,
  ) => {
    if (!isTabList) {
      return;
    }

    const enabledOptions = options.filter((option) => !option.disabled);
    const currentOptionIndex = enabledOptions.findIndex(
      (option) => option.value === optionValue,
    );

    if (currentOptionIndex === -1 || enabledOptions.length === 0) {
      return;
    }

    const lastOptionIndex = enabledOptions.length - 1;

    const optionIndexByKey: Partial<Record<string, number>> = {
      ArrowDown: (currentOptionIndex + 1) % enabledOptions.length,
      ArrowLeft:
        currentOptionIndex === 0 ? lastOptionIndex : currentOptionIndex - 1,
      ArrowRight: (currentOptionIndex + 1) % enabledOptions.length,
      ArrowUp:
        currentOptionIndex === 0 ? lastOptionIndex : currentOptionIndex - 1,
      End: lastOptionIndex,
      Home: 0,
    };

    const nextOptionIndex = optionIndexByKey[event.key];

    if (nextOptionIndex === undefined) {
      return;
    }

    event.preventDefault();
    focusAndSelectOption(enabledOptions[nextOptionIndex].value);
  };

  return (
    <div
      className={clsx(styles.container, className)}
      role={role}
      aria-label={ariaLabel}
    >
      {options.map(
        (
          {
            Icon,
            ariaLabel: itemAriaLabel,
            disabled,
            label,
            value: optionValue,
          }: SegmentedControlOptionButtonProps<Value>,
          index,
        ) => {
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
              onKeyDown={(event) => handleTabKeyDown(event, optionValue)}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
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
                        : theme.font.color.secondary
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
