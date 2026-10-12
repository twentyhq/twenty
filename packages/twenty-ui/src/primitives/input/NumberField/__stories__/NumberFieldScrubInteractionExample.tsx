import { Field } from '@ui/primitives/input/Field/Field';

import { NumberField } from '../NumberField';
import { type NumberFieldRootProps } from '../types/NumberFieldRootProps';

export const NumberFieldScrubInteractionExample = (
  props: NumberFieldRootProps,
) => (
  <Field.Root>
    <NumberField.Root
      {...props}
      render={(rootProps, state) => (
        <div {...rootProps} data-scrubbing={String(state.scrubbing)} />
      )}
    >
      <NumberField.ScrubArea
        pixelSensitivity={1}
        aria-label="Scrub quantity"
        render={(scrubProps, state) => (
          <span {...scrubProps} data-scrubbing={String(state.scrubbing)} />
        )}
      >
        <Field.Label>Quantity</Field.Label>
        <NumberField.ScrubAreaCursor aria-label="Quantity scrub cursor">
          ↔
        </NumberField.ScrubAreaCursor>
      </NumberField.ScrubArea>
      <NumberField.Input />
    </NumberField.Root>
    <Field.Description>
      Drag the label to change the quantity.
    </Field.Description>
  </Field.Root>
);
