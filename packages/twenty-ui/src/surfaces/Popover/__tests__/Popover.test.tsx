import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Popover } from '../Popover';
import styles from '../Popover.module.scss';

const PopoverRootWrapper = ({ children }: { children: ReactNode }) => (
  <Popover.Root>{children}</Popover.Root>
);
const OpenPopoverWrapper = ({ children }: { children: ReactNode }) => (
  <Popover.Root open>{children}</Popover.Root>
);
const PopoverPopupWrapper = ({ children }: { children: ReactNode }) => (
  <Popover.Root open>
    <Popover.Popup>{children}</Popover.Popup>
  </Popover.Root>
);

runComponentConformance({
  name: 'Popover.Trigger',
  element: <Popover.Trigger>Open</Popover.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: PopoverRootWrapper,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'Popover.Popup',
  element: <Popover.Popup />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenPopoverWrapper,
  ownClassName: styles.popup,
});
runComponentConformance({
  name: 'Popover.Title',
  element: <Popover.Title>Title</Popover.Title>,
  refInstanceOf: HTMLHeadingElement,
  wrapper: PopoverPopupWrapper,
  ownClassName: styles.title,
});
runComponentConformance({
  name: 'Popover.Description',
  element: <Popover.Description>Description</Popover.Description>,
  refInstanceOf: HTMLParagraphElement,
  wrapper: PopoverPopupWrapper,
  ownClassName: styles.description,
});
runComponentConformance({
  name: 'Popover.Close',
  element: <Popover.Close>Close</Popover.Close>,
  refInstanceOf: HTMLButtonElement,
  wrapper: PopoverPopupWrapper,
  renderPropTagName: 'button',
});
