import { type ReactNode } from 'react';

import { AlertDialog } from '../AlertDialog';
import { type AlertDialogPopupProps } from '../types/AlertDialogPopupProps';
import { type AlertDialogRootProps } from '../types/AlertDialogRootProps';

import styles from './AlertDialog.stories.module.scss';

export type AlertDialogExampleProps = AlertDialogRootProps & {
  size?: AlertDialogPopupProps['size'];
  popupProps?: AlertDialogPopupProps;
  disabled?: boolean;
  content?: ReactNode;
};

export const AlertDialogExample = ({
  size,
  popupProps,
  disabled,
  content,
  ...props
}: AlertDialogExampleProps) => (
  <AlertDialog.Root {...props}>
    <AlertDialog.Trigger className={styles.button} disabled={disabled}>
      Delete record
    </AlertDialog.Trigger>
    <AlertDialog.Popup size={size} {...popupProps}>
      <AlertDialog.Header>
        <AlertDialog.Title>Delete this record?</AlertDialog.Title>
        <AlertDialog.Description>
          This record will be permanently deleted. This action cannot be undone.
        </AlertDialog.Description>
      </AlertDialog.Header>
      {content && <AlertDialog.Body>{content}</AlertDialog.Body>}
      <AlertDialog.Footer>
        <AlertDialog.Close className={styles.button}>Cancel</AlertDialog.Close>
        <AlertDialog.Close className={styles.button} data-danger>
          Delete
        </AlertDialog.Close>
      </AlertDialog.Footer>
    </AlertDialog.Popup>
  </AlertDialog.Root>
);
