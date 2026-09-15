import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Select } from '../Select';
import styles from '../Select.module.scss';

const SelectRootWrapper = ({ children }: { children: ReactNode }) => (
  <Select.Root>{children}</Select.Root>
);
const SelectTriggerWrapper = ({ children }: { children: ReactNode }) => (
  <Select.Root>
    <Select.Trigger>{children}</Select.Trigger>
  </Select.Root>
);
const OpenSelectWrapper = ({ children }: { children: ReactNode }) => (
  <Select.Root open>{children}</Select.Root>
);
const SelectPopupWrapper = ({ children }: { children: ReactNode }) => (
  <Select.Root open>
    <Select.Popup>{children}</Select.Popup>
  </Select.Root>
);
const SelectGroupWrapper = ({ children }: { children: ReactNode }) => (
  <Select.Root open>
    <Select.Popup>
      <Select.Group>{children}</Select.Group>
    </Select.Popup>
  </Select.Root>
);

runComponentConformance({
  name: 'Select.Trigger',
  element: <Select.Trigger>Choose</Select.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: SelectRootWrapper,
  ownClassName: styles.trigger,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'Select.Value',
  element: <Select.Value placeholder="Choose" />,
  refInstanceOf: HTMLSpanElement,
  wrapper: SelectTriggerWrapper,
  ownClassName: styles.value,
});
runComponentConformance({
  name: 'Select.Popup',
  element: <Select.Popup />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenSelectWrapper,
  ownClassName: styles.popup,
});
runComponentConformance({
  name: 'Select.Item',
  element: <Select.Item value="first">First</Select.Item>,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectPopupWrapper,
  ownClassName: styles.item,
});
runComponentConformance({
  name: 'Select.Group',
  element: <Select.Group />,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectPopupWrapper,
});
runComponentConformance({
  name: 'Select.GroupLabel',
  element: <Select.GroupLabel>Group</Select.GroupLabel>,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectGroupWrapper,
  ownClassName: styles.groupLabel,
});
runComponentConformance({
  name: 'Select.Separator',
  element: <Select.Separator />,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectPopupWrapper,
  ownClassName: styles.separator,
});
