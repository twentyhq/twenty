import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import listItemStyles from '@ui/primitives/navigation/ListItem/ListItem.module.scss';

import { Menu } from '../Menu';
import styles from '../Menu.module.scss';

const MenuRootWrapper = ({ children }: { children: ReactNode }) => (
  <Menu.Root>{children}</Menu.Root>
);
const OpenMenuWrapper = ({ children }: { children: ReactNode }) => (
  <Menu.Root open>
    <Menu.Portal>
      <Menu.Positioner>{children}</Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
);
const MenuPortalWrapper = ({ children }: { children: ReactNode }) => (
  <Menu.Root open>
    <Menu.Portal>{children}</Menu.Portal>
  </Menu.Root>
);
const MenuPopupWrapper = ({ children }: { children: ReactNode }) => (
  <OpenMenuWrapper>
    <Menu.Popup>{children}</Menu.Popup>
  </OpenMenuWrapper>
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

runComponentConformance({
  name: 'Menu.Portal',
  element: <Menu.Portal />,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => <Menu.Root open>{children}</Menu.Root>,
});
runComponentConformance({
  name: 'Menu.Positioner',
  element: <Menu.Positioner />,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPortalWrapper,
  ownClassName: styles.positioner,
});
runComponentConformance({
  name: 'Menu.Arrow',
  element: <Menu.Arrow />,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
});
runComponentConformance({
  name: 'Menu.Backdrop',
  element: <Menu.Backdrop />,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPortalWrapper,
});
runComponentConformance({
  name: 'Menu.LinkItem',
  element: <Menu.LinkItem href="/records">Records</Menu.LinkItem>,
  refInstanceOf: HTMLAnchorElement,
  wrapper: MenuPopupWrapper,
  renderPropTagName: 'a',
});
runComponentConformance({
  name: 'Menu.CheckboxItemIndicator',
  element: <Menu.CheckboxItemIndicator />,
  refInstanceOf: HTMLSpanElement,
  wrapper: ({ children }) => (
    <MenuPopupWrapper>
      <Menu.CheckboxItem defaultChecked>{children}</Menu.CheckboxItem>
    </MenuPopupWrapper>
  ),
});
runComponentConformance({
  name: 'Menu.RadioItemIndicator',
  element: <Menu.RadioItemIndicator />,
  refInstanceOf: HTMLSpanElement,
  wrapper: ({ children }) => (
    <MenuPopupWrapper>
      <Menu.RadioGroup defaultValue="selected">
        <Menu.RadioItem value="selected">{children}</Menu.RadioItem>
      </Menu.RadioGroup>
    </MenuPopupWrapper>
  ),
});
runComponentConformance({
  name: 'Menu.Viewport',
  element: <Menu.Viewport />,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
});
