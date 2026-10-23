import { isNumber } from '@sniptt/guards';
import { useRef } from 'react';

import { Select } from '@ui/primitives/input/Select/Select';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';

import { type DatePickerProps } from '../types/DatePickerProps';
import { DatePickerSelectLifecycleEffect } from './DatePickerSelectLifecycleEffect';

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
  const isOpenRef = useRef(false);

  return (
    <Select.Root
      value={value}
      items={items}
      disabled={disabled}
      onOpenChange={(open) => {
        if (open) {
          isOpenRef.current = true;
          onOpenChange?.(true);
        }
      }}
      onOpenChangeComplete={(open) => {
        if (!open && isOpenRef.current) {
          isOpenRef.current = false;
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
      <DatePickerSelectLifecycleEffect
        isOpenRef={isOpenRef}
        onOpenChange={onOpenChange}
      />
      <Select.Trigger aria-label={label}>
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal container={portalContainer}>
        <Select.Positioner
          sideOffset={THEME_COMMON.spacingMultiplicator}
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
