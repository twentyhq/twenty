import { type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';

import { type IconComponent } from '@ui/icon';
import { useTheme } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';

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

type SegmentedControlItemWidth = 'content' | 'equal';

type SegmentedControlStyle = CSSProperties & {
  '--segmented-control-width'?: string;
};

export type SegmentedControlProps<Value extends string> = {
  ariaLabel: string;
  itemWidth?: SegmentedControlItemWidth;
  onChange: (value: Value) => void;
  options: SegmentedControlOption<Value>[];
  role?: 'group' | 'tablist';
  value: Value;
  width?: number | string;
};

export const SegmentedControl = <Value extends string>({
  ariaLabel,
  itemWidth = 'equal',
  onChange,
  options,
  role = 'group',
  value,
  width,
}: SegmentedControlProps<Value>) => {
  const theme = useTheme();
  const isTabList = role === 'tablist';
  const segmentedControlStyle: SegmentedControlStyle | undefined = isDefined(
    width,
  )
    ? {
        '--segmented-control-width':
          typeof width === 'number' ? `${width}px` : width,
      }
    : undefined;

  const focusAndSelectOption = ({
    event,
    optionIndex,
    optionValue,
  }: {
    event: KeyboardEvent<HTMLButtonElement>;
    optionIndex: number;
    optionValue: Value;
  }) => {
    onChange(optionValue);

    const enabledOptionButtons = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        'button:not(:disabled)',
      ) ?? [],
    );

    enabledOptionButtons[optionIndex]?.focus();
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

    if (!isDefined(nextOptionIndex)) {
      return;
    }

    event.preventDefault();
    focusAndSelectOption({
      event,
      optionIndex: nextOptionIndex,
      optionValue: enabledOptions[nextOptionIndex].value,
    });
  };

  return (
    <div
      className={styles.container}
      role={role}
      aria-label={ariaLabel}
      style={segmentedControlStyle}
    >
      {options.map(
        ({
          Icon,
          ariaLabel: itemAriaLabel,
          disabled,
          label,
          value: optionValue,
        }: SegmentedControlOptionButtonProps<Value>) => {
          const isSelected = optionValue === value;
          const inferredAriaLabel =
            itemAriaLabel ?? (typeof label === 'string' ? label : undefined);
          const hasLabel = isDefined(label);

          return (
            <button
              aria-label={inferredAriaLabel}
              aria-pressed={!isTabList ? isSelected : undefined}
              aria-selected={isTabList ? isSelected : undefined}
              className={clsx(styles.item, !hasLabel && styles.iconOnly)}
              data-active={isSelected || undefined}
              disabled={disabled}
              data-item-width={itemWidth}
              key={optionValue}
              onClick={() => onChange(optionValue)}
              onKeyDown={(event) => handleTabKeyDown(event, optionValue)}
              role={isTabList ? 'tab' : undefined}
              tabIndex={isTabList ? (isSelected ? 0 : -1) : undefined}
              type="button"
            >
              {Icon && (
                <span className={styles.icon}>
                  <Icon
                    aria-hidden={hasLabel || isDefined(inferredAriaLabel)}
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
