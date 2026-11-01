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
  <Select.Root open defaultValue="first" modal={false}>
    <Select.Trigger aria-label="Choose" />
    {children}
  </Select.Root>
);
const SelectPositionerWrapper = ({ children }: { children: ReactNode }) => (
  <OpenSelectWrapper>
    <Select.Positioner alignItemWithTrigger={false}>
      {children}
    </Select.Positioner>
  </OpenSelectWrapper>
);
const SelectPopupWrapper = ({ children }: { children: ReactNode }) => (
  <SelectPositionerWrapper>
    <Select.Popup>{children}</Select.Popup>
  </SelectPositionerWrapper>
);
const SelectGroupWrapper = ({ children }: { children: ReactNode }) => (
  <SelectPopupWrapper>
    <Select.Group>{children}</Select.Group>
  </SelectPopupWrapper>
);
const SelectItemWrapper = ({ children }: { children: ReactNode }) => (
  <SelectPopupWrapper>
    <Select.Item value="first">{children}</Select.Item>
  </SelectPopupWrapper>
);

runComponentConformance({
  name: 'Select.Label',
  element: <Select.Label>Choose</Select.Label>,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectRootWrapper,
});
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
  name: 'Select.Icon',
  element: <Select.Icon />,
  refInstanceOf: HTMLSpanElement,
  wrapper: SelectTriggerWrapper,
  ownClassName: styles.icon,
});
runComponentConformance({
  name: 'Select.Portal',
  element: <Select.Portal />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenSelectWrapper,
});
runComponentConformance({
  name: 'Select.Backdrop',
  element: <Select.Backdrop />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenSelectWrapper,
});
runComponentConformance({
  name: 'Select.Positioner',
  element: <Select.Positioner alignItemWithTrigger={false} />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenSelectWrapper,
  ownClassName: styles.positioner,
});
runComponentConformance({
  name: 'Select.Popup',
  element: <Select.Popup />,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectPositionerWrapper,
  ownClassName: styles.popup,
});
runComponentConformance({
  name: 'Select.List',
  element: <Select.List />,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectPopupWrapper,
});
runComponentConformance({
  name: 'Select.Item',
  element: <Select.Item value="first">First</Select.Item>,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectPopupWrapper,
  ownClassName: styles.item,
});
runComponentConformance({
  name: 'Select.ItemText',
  element: <Select.ItemText>First</Select.ItemText>,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectItemWrapper,
});
runComponentConformance({
  name: 'Select.ItemIndicator',
  element: <Select.ItemIndicator />,
  refInstanceOf: HTMLSpanElement,
  wrapper: SelectItemWrapper,
  ownClassName: styles.indicator,
});
runComponentConformance({
  name: 'Select.Arrow',
  element: <Select.Arrow />,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectPopupWrapper,
});
runComponentConformance({
  name: 'Select.ScrollUpArrow',
  element: <Select.ScrollUpArrow keepMounted />,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectPopupWrapper,
});
runComponentConformance({
  name: 'Select.ScrollDownArrow',
  element: <Select.ScrollDownArrow keepMounted />,
  refInstanceOf: HTMLDivElement,
  wrapper: SelectPopupWrapper,
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
