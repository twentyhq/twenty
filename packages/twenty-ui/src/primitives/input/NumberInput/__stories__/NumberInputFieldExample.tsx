import { useRef } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';

import { NumberInput } from '../NumberInput';
import { type NumberInputProps } from '../types/NumberInputProps';

export const NumberInputFieldExample = (props: NumberInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Field.Root invalid>
        <Field.Label>Quantity</Field.Label>
        <NumberInput {...props} aria-label={undefined} ref={inputRef} />
        <Field.Description>
          Choose a quantity between zero and two.
        </Field.Description>
        <Field.Error match>Check the quantity.</Field.Error>
      </Field.Root>
      <Button onClick={() => inputRef.current?.focus()}>Focus quantity</Button>
    </>
  );
};
