import { useRef } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';

import { NumberStepper } from '../NumberStepper';
import { type NumberStepperProps } from '../types/NumberStepperProps';

export const NumberStepperFieldExample = (props: NumberStepperProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Field.Root invalid>
        <Field.Label>Quantity</Field.Label>
        <NumberStepper {...props} aria-label={undefined} ref={inputRef} />
        <Field.Description>
          Choose a quantity between zero and two.
        </Field.Description>
        <Field.Error match>Check the quantity.</Field.Error>
      </Field.Root>
      <Button onClick={() => inputRef.current?.focus()}>Focus quantity</Button>
    </>
  );
};
