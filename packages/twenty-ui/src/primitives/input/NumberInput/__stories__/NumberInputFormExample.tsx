import { useId, useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { NumberInput } from '../NumberInput';
import { type NumberInputProps } from '../types/NumberInputProps';

export const NumberInputFormExample = ({
  external = false,
  ...props
}: NumberInputProps & { external?: boolean }) => {
  const formId = useId();
  const [savedQuantity, setSavedQuantity] = useState('Not saved');
  const [submissionCount, setSubmissionCount] = useState(0);

  const input = <NumberInput {...props} form={formId} name="quantity" />;

  return (
    <>
      {external && input}
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          setSavedQuantity(
            String(new FormData(event.currentTarget).get('quantity')),
          );
          setSubmissionCount((count) => count + 1);
        }}
      >
        {!external && input}
        <Button type="submit">Save quantity</Button>
      </form>
      <output aria-label="Saved quantity">{savedQuantity}</output>
      <output aria-label="Submission count">{submissionCount}</output>
    </>
  );
};
