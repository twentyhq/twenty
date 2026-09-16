import { Button } from '@ui/primitives/input/Button/Button';

import { Dialog } from '../Dialog';
import { type DialogExampleProps } from './DialogExampleProps';

export const DialogExample = ({
  size,
  popupProps,
  disabled,
  content,
  ...props
}: DialogExampleProps) => (
  <Dialog.Root {...props}>
    <Dialog.Trigger
      disabled={disabled}
      render={<Button aria-label="Edit account" title="Edit account" />}
    />
    <Dialog.Popup size={size} {...popupProps}>
      <Dialog.Header>
        <Dialog.Title>Edit account</Dialog.Title>
        <Dialog.Description>Update the account details.</Dialog.Description>
      </Dialog.Header>
      {content && <Dialog.Body>{content}</Dialog.Body>}
      <Dialog.Footer>
        <Dialog.Close
          render={
            <Button aria-label="Close" title="Close" variant="secondary" />
          }
        />
        <Dialog.Close render={<Button aria-label="Save" title="Save" />} />
      </Dialog.Footer>
    </Dialog.Popup>
  </Dialog.Root>
);
