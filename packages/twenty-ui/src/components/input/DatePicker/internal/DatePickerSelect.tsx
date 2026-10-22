import { isNumber } from '@sniptt/guards';

import { Select } from '@ui/primitives/input/Select/Select';
import { useTheme } from '@ui/theme/useTheme';

import { type DatePickerProps } from '../types/DatePickerProps';

type DatePickerSelectProps = {
  value: number;
  items: { value: number; label: string }[];
  onValueChange: (value: number) => void;
  label: string;
  disabled?: boolean;
  portalContainer?: DatePickerProps['portalContainer'];
  onOpenChange?: (open: boolean) => void;
};

export const DatePickerSelect = ({
  value,
  items,
  onValueChange,
  label,
  disabled,
  portalContainer,
  onOpenChange,
}: DatePickerSelectProps) => {
  const theme = useTheme();

  return (
    <Select.Root
      value={value}
      items={items}
      disabled={disabled}
      onOpenChange={(open) => {
        if (open) {
          onOpenChange?.(true);
        }
      }}
      onOpenChangeComplete={(open) => {
        if (!open) {
          onOpenChange?.(false);
        }
      }}
      onValueChange={(nextValue) => {
        if (!isNumber(nextValue)) {
          return;
        }

        onValueChange(nextValue);
      }}
    >
      <Select.Trigger aria-label={label}>
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal container={portalContainer}>
        <Select.Positioner
          sideOffset={Number.parseFloat(theme.spacing[1])}
          alignItemWithTrigger={false}
        >
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
};
