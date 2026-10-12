import { useId, useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { NumberStepper } from '../NumberStepper';
import { type NumberStepperProps } from '../types/NumberStepperProps';

export const NumberStepperFormExample = ({
  external = false,
  ...props
}: NumberStepperProps & { external?: boolean }) => {
  const formId = useId();
  const [savedQuantity, setSavedQuantity] = useState('Not saved');
  const [submissionCount, setSubmissionCount] = useState(0);

  const input = <NumberStepper {...props} form={formId} name="quantity" />;

  return (
    <>
      {external && input}
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          setSavedQuantity(
            String(new FormData(event.currentTarget).get('quantity') ?? ''),
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
