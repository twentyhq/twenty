import { useState } from 'react';

import { type NumberFieldRootProps } from '../types/NumberFieldRootProps';
import { NumberFieldInteractionExample } from './NumberFieldInteractionExample';

export const ControlledNumberFieldInteractionExample = ({
  defaultValue,
  onValueChange,
  ...props
}: NumberFieldRootProps) => {
  const [value, setValue] = useState<number | null>(defaultValue ?? null);

  return (
    <NumberFieldInteractionExample
      {...props}
      value={value}
      onValueChange={(nextValue, eventDetails) => {
        onValueChange?.(nextValue, eventDetails);

        if (eventDetails.isCanceled) {
          return;
        }

        setValue(nextValue);
      }}
    />
  );
};
