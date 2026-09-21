import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { Dialog } from '../Dialog';

const DialogRootWrapper = ({ children }: { children: ReactNode }) => (
  <Dialog.Root>{children}</Dialog.Root>
);
const OpenDialogWrapper = ({ children }: { children: ReactNode }) => (
  <Dialog.Root open>{children}</Dialog.Root>
);
const DialogPopupWrapper = ({ children }: { children: ReactNode }) => (
  <Dialog.Root open>
    <Dialog.Popup initialFocus={false}>{children}</Dialog.Popup>
  </Dialog.Root>
);

runComponentConformance({
  name: 'Dialog.Trigger',
  element: <Dialog.Trigger>Open</Dialog.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: DialogRootWrapper,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'Dialog.Popup',
  element: <Dialog.Popup initialFocus={false} />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenDialogWrapper,
  ownClassName: styles.popup,
});
runComponentConformance({
  name: 'Dialog.Description',
  element: <Dialog.Description>Description</Dialog.Description>,
  refInstanceOf: HTMLParagraphElement,
  wrapper: DialogPopupWrapper,
  ownClassName: styles.description,
});
runComponentConformance({
  name: 'Dialog.Close',
  element: <Dialog.Close>Cancel</Dialog.Close>,
  refInstanceOf: HTMLButtonElement,
  wrapper: DialogPopupWrapper,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'Dialog.Header',
  element: <Dialog.Header>Header</Dialog.Header>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.header,
});
runComponentConformance({
  name: 'Dialog.Body',
  element: <Dialog.Body>Body</Dialog.Body>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.body,
});
runComponentConformance({
  name: 'Dialog.Footer',
  element: <Dialog.Footer>Footer</Dialog.Footer>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.footer,
});
