import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import listItemStyles from '@ui/navigation/ListItem/ListItem.module.scss';

import { Menu } from '../Menu';
import styles from '../Menu.module.scss';

const MenuRootWrapper = ({ children }: { children: ReactNode }) => (
  <Menu.Root>{children}</Menu.Root>
);
const OpenMenuWrapper = ({ children }: { children: ReactNode }) => (
  <Menu.Root open>{children}</Menu.Root>
);
const MenuPopupWrapper = ({ children }: { children: ReactNode }) => (
  <Menu.Root open>
    <Menu.Popup>{children}</Menu.Popup>
  </Menu.Root>
);
const MenuRadioGroupWrapper = ({ children }: { children: ReactNode }) => (
  <MenuPopupWrapper>
    <Menu.RadioGroup>{children}</Menu.RadioGroup>
  </MenuPopupWrapper>
);
const MenuGroupWrapper = ({ children }: { children: ReactNode }) => (
  <MenuPopupWrapper>
    <Menu.Group>{children}</Menu.Group>
  </MenuPopupWrapper>
);
const MenuSubmenuWrapper = ({ children }: { children: ReactNode }) => (
  <MenuPopupWrapper>
    <Menu.SubmenuRoot>{children}</Menu.SubmenuRoot>
  </MenuPopupWrapper>
);

runComponentConformance({
  name: 'Menu.Trigger',
  element: <Menu.Trigger>Options</Menu.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: MenuRootWrapper,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'Menu.Popup',
  element: <Menu.Popup />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenMenuWrapper,
  ownClassName: styles.popup,
});
runComponentConformance({
  name: 'Menu.Item',
  element: <Menu.Item>Item</Menu.Item>,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
  ownClassName: listItemStyles.root,
});
runComponentConformance({
  name: 'Menu.CheckboxItem',
  element: <Menu.CheckboxItem>Item</Menu.CheckboxItem>,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
  ownClassName: listItemStyles.root,
});
runComponentConformance({
  name: 'Menu.RadioItem',
  element: <Menu.RadioItem value="a">Item</Menu.RadioItem>,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuRadioGroupWrapper,
  ownClassName: listItemStyles.root,
});
runComponentConformance({
  name: 'Menu.SubmenuTrigger',
  element: <Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuSubmenuWrapper,
  ownClassName: listItemStyles.root,
});
runComponentConformance({
  name: 'Menu.RadioGroup',
  element: <Menu.RadioGroup />,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
  ownClassName: styles.group,
});
runComponentConformance({
  name: 'Menu.Group',
  element: <Menu.Group />,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
  ownClassName: styles.group,
});
runComponentConformance({
  name: 'Menu.GroupLabel',
  element: <Menu.GroupLabel>Group</Menu.GroupLabel>,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuGroupWrapper,
  ownClassName: styles.groupLabel,
});
runComponentConformance({
  name: 'Menu.Separator',
  element: <Menu.Separator />,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
  ownClassName: styles.separator,
});
