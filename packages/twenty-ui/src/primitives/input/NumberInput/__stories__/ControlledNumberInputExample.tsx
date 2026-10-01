import { useState } from 'react';

import { NumberInput } from '../NumberInput';
import { type NumberInputProps } from '../types/NumberInputProps';

export const ControlledNumberInputExample = (props: NumberInputProps) => {
  const [value, setValue] = useState<number | null>(props.defaultValue ?? null);

  return (
    <NumberInput
      {...props}
      value={value}
      onValueChange={(nextValue, eventDetails) => {
        props.onValueChange?.(nextValue, eventDetails);
        setValue(nextValue);
      }}
    />
  );
};
