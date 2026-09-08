import { Select } from '../Select';
import { type SelectPopupProps } from '../types/SelectPopupProps';
import { type SelectRootProps } from '../types/SelectRootProps';
import { type SelectTriggerProps } from '../types/SelectTriggerProps';

export const SELECT_ITEMS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Dragon fruit', value: 'dragon-fruit' },
];

export type SelectExampleProps = SelectRootProps<string, boolean> &
  Pick<SelectTriggerProps, 'size'> &
  Pick<
    SelectPopupProps,
    'container' | 'side' | 'align' | 'alignItemWithTrigger'
  >;

export const SelectExample = ({
  size,
  container,
  side,
  align,
  alignItemWithTrigger,
  ...props
}: SelectExampleProps) => (
  <Select.Root items={SELECT_ITEMS} {...props}>
    <Select.Trigger size={size} aria-label="Fruit">
      <Select.Value placeholder="Choose a fruit" />
    </Select.Trigger>
    <Select.Popup
      container={container}
      side={side}
      align={align}
      alignItemWithTrigger={alignItemWithTrigger}
    >
      {SELECT_ITEMS.map(({ value, label }) => (
        <Select.Item key={value} value={value} disabled={value === 'banana'}>
          {label}
        </Select.Item>
      ))}
    </Select.Popup>
  </Select.Root>
);
