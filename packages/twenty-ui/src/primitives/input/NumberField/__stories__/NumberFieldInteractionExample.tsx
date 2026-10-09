import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';

import { NumberField } from '../NumberField';
import { type NumberFieldRootProps } from '../types/NumberFieldRootProps';

export const NumberFieldInteractionExample = ({
  label = 'Quantity',
  ...props
}: NumberFieldRootProps & { label?: string }) => (
  <>
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <NumberField.Root {...props}>
        <NumberField.Group>
          <NumberField.Decrement aria-label="Decrease value">
            −
          </NumberField.Decrement>
          <NumberField.Input />
          <NumberField.Increment aria-label="Increase value">
            +
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>
      <Field.Description>
        Enter a quantity or use the controls.
      </Field.Description>
    </Field.Root>
    <Button type="button">Finish editing</Button>
  </>
);
