import { Button } from '@ui/primitives/input/Button/Button';
import { isDefined } from '@ui/utilities/utils/isDefined';

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
      render={<Button>Edit account</Button>}
    />
    <Dialog.Popup size={size} {...popupProps}>
      <Dialog.Header>
        <Dialog.Title>Edit account</Dialog.Title>
        <Dialog.Description>Update the account details.</Dialog.Description>
      </Dialog.Header>
      {isDefined(content) && <Dialog.Body>{content}</Dialog.Body>}
      <Dialog.Footer>
        <Dialog.Close render={<Button variant="outline">Close</Button>} />
        <Dialog.Close render={<Button>Save</Button>} />
      </Dialog.Footer>
    </Dialog.Popup>
  </Dialog.Root>
);
