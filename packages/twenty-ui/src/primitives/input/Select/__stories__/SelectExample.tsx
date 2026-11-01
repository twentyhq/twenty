import { Select } from '../Select';
import { type SelectExampleProps } from './SelectExampleProps';
import { SELECT_ITEMS } from './selectItems';

export const SelectExample = ({
  size,
  container,
  side,
  sideOffset = 8,
  align = 'start',
  alignItemWithTrigger = false,
  ...props
}: SelectExampleProps) => (
  <Select.Root {...props} items={SELECT_ITEMS}>
    <Select.Trigger size={size} aria-label="Fruit">
      <Select.Value placeholder="Choose a fruit" />
      <Select.Icon />
    </Select.Trigger>
    <Select.Portal container={container}>
      <Select.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
      >
        <Select.Popup>
          {SELECT_ITEMS.map(({ value, label }) => (
            <Select.Item
              key={value}
              value={value}
              disabled={value === 'banana'}
            >
              <Select.ItemText>{label}</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
);
