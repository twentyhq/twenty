import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import styles from '../../internal/Dialog.module.scss';
import { AlertDialog } from '../AlertDialog';

const AlertDialogRootWrapper = ({ children }: { children: ReactNode }) => (
  <AlertDialog.Root>{children}</AlertDialog.Root>
);
const OpenAlertDialogWrapper = ({ children }: { children: ReactNode }) => (
  <AlertDialog.Root open>{children}</AlertDialog.Root>
);
const AlertDialogPopupWrapper = ({ children }: { children: ReactNode }) => (
  <AlertDialog.Root open>
    <AlertDialog.Popup initialFocus={false}>{children}</AlertDialog.Popup>
  </AlertDialog.Root>
);

runComponentConformance({
  name: 'AlertDialog.Trigger',
  element: <AlertDialog.Trigger>Open</AlertDialog.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: AlertDialogRootWrapper,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'AlertDialog.Popup',
  element: <AlertDialog.Popup initialFocus={false} />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenAlertDialogWrapper,
  ownClassName: styles.popup,
});
runComponentConformance({
  name: 'AlertDialog.Title',
  element: <AlertDialog.Title>Title</AlertDialog.Title>,
  refInstanceOf: HTMLHeadingElement,
  wrapper: AlertDialogPopupWrapper,
  ownClassName: styles.title,
});
runComponentConformance({
  name: 'AlertDialog.Description',
  element: <AlertDialog.Description>Description</AlertDialog.Description>,
  refInstanceOf: HTMLParagraphElement,
  wrapper: AlertDialogPopupWrapper,
  ownClassName: styles.description,
});
runComponentConformance({
  name: 'AlertDialog.Close',
  element: <AlertDialog.Close>Cancel</AlertDialog.Close>,
  refInstanceOf: HTMLButtonElement,
  wrapper: AlertDialogPopupWrapper,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'AlertDialog.Header',
  element: <AlertDialog.Header>Header</AlertDialog.Header>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.header,
});
runComponentConformance({
  name: 'AlertDialog.Body',
  element: <AlertDialog.Body>Body</AlertDialog.Body>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.body,
});
runComponentConformance({
  name: 'AlertDialog.Footer',
  element: <AlertDialog.Footer>Footer</AlertDialog.Footer>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.footer,
});
