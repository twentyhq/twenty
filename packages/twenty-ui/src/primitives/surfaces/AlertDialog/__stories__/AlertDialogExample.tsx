import { Button } from '@ui/primitives/input/Button/Button';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { AlertDialog } from '../AlertDialog';
import { type AlertDialogExampleProps } from './AlertDialogExampleProps';

export const AlertDialogExample = ({
  size,
  popupProps,
  portalProps,
  disabled,
  content,
  ...props
}: AlertDialogExampleProps) => (
  <AlertDialog.Root {...props}>
    <AlertDialog.Trigger
      disabled={disabled}
      render={<Button variant="solid">Delete record</Button>}
    />
    <AlertDialog.Portal {...portalProps}>
      <AlertDialog.Backdrop />
      <AlertDialog.Viewport>
        <AlertDialog.Popup size={size} {...popupProps}>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete this record?</AlertDialog.Title>
            <AlertDialog.Description>
              This record will be permanently deleted. This action cannot be
              undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          {isDefined(content) && <AlertDialog.Body>{content}</AlertDialog.Body>}
          <AlertDialog.Footer>
            <AlertDialog.Close render={<Button>Cancel</Button>} />
            <AlertDialog.Close
              render={<Button color="danger">Delete</Button>}
            />
          </AlertDialog.Footer>
        </AlertDialog.Popup>
      </AlertDialog.Viewport>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
