import { useState } from 'react';

import { NumberStepper } from '../NumberStepper';
import { type NumberStepperProps } from '../types/NumberStepperProps';

export const ControlledNumberStepperExample = (props: NumberStepperProps) => {
  const [value, setValue] = useState<number | null>(props.defaultValue ?? null);

  return (
    <NumberStepper
      {...props}
      value={value}
      onValueChange={(nextValue, eventDetails) => {
        props.onValueChange?.(nextValue, eventDetails);

        if (!eventDetails.isCanceled) {
          setValue(nextValue);
        }
      }}
    />
  );
};
