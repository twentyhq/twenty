import { isNumber } from '@sniptt/guards';

import { Select } from '@ui/primitives/input/Select/Select';

import styles from '../DateCalendar.module.scss';

type DateCalendarSelectProps = {
  value: number;
  items: { value: number; label: string }[];
  onValueChange: (value: number) => void;
  label: string;
  disabled?: boolean;
};

export const DateCalendarSelect = ({
  value,
  items,
  onValueChange,
  label,
  disabled,
}: DateCalendarSelectProps) => (
  <Select.Root
    value={value}
    items={items}
    disabled={disabled}
    onValueChange={(nextValue) => {
      if (!isNumber(nextValue)) {
        return;
      }

      onValueChange(nextValue);
    }}
  >
    <Select.Trigger className={styles.selectTrigger} aria-label={label}>
      <Select.Value />
      <Select.Icon />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner sideOffset={4} alignItemWithTrigger={false}>
        <Select.Popup>
          {items.map(({ value: itemValue, label: itemLabel }) => (
            <Select.Item key={itemValue} value={itemValue}>
              <Select.ItemText>{itemLabel}</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
);
