import { useId, useRef, useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';

import { NumberField } from '../NumberField';
import { type NumberFieldRootProps } from '../types/NumberFieldRootProps';

export const NumberFieldFormInteractionExample = (
  props: NumberFieldRootProps,
) => {
  const formId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const visibleInputRef = useRef<HTMLInputElement>(null);
  const [savedQuantity, setSavedQuantity] = useState('Not saved');
  const [refTargets, setRefTargets] = useState('Not inspected');

  return (
    <>
      <Field.Root>
        <Field.Label>Quantity</Field.Label>
        <NumberField.Root
          {...props}
          ref={rootRef}
          inputRef={hiddenInputRef}
          form={formId}
          name="quantity"
          render={(rootProps, state) => (
            <div {...rootProps} data-quantity={state.value ?? 'empty'} />
          )}
        >
          <NumberField.Group
            render={<section aria-label="Quantity controls" />}
          >
            <NumberField.Input
              ref={visibleInputRef}
              render={(inputProps, state) => (
                <input {...inputProps} data-quantity={state.value ?? 'empty'} />
              )}
            />
            <NumberField.Increment
              nativeButton={false}
              render={<span />}
              aria-label="Increase value"
            >
              +
            </NumberField.Increment>
          </NumberField.Group>
        </NumberField.Root>
        <Field.Description>Enter the amount to save.</Field.Description>
      </Field.Root>
      <form
        id={formId}
        aria-label="Quantity form"
        onSubmit={(event) => {
          event.preventDefault();
          setSavedQuantity(
            String(new FormData(event.currentTarget).get('quantity') ?? ''),
          );
        }}
      >
        <Button type="submit">Save quantity</Button>
      </form>
      <Button
        type="button"
        onClick={() => {
          setRefTargets(
            `${rootRef.current?.tagName}/${visibleInputRef.current?.type}/${hiddenInputRef.current?.type}/${hiddenInputRef.current?.form?.id === formId}`,
          );
          visibleInputRef.current?.focus();
        }}
      >
        Inspect refs and focus
      </Button>
      <output aria-label="Saved quantity">{savedQuantity}</output>
      <output aria-label="Ref targets">{refTargets}</output>
    </>
  );
};
