import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Tabs } from '../Tabs';
import styles from '../Tabs.module.scss';

const RootWrapper = ({ children }: { children: ReactNode }) => (
  <Tabs.Root defaultValue="overview">{children}</Tabs.Root>
);

const ListWrapper = ({ children }: { children: ReactNode }) => (
  <RootWrapper>
    <Tabs.List aria-label="Details">{children}</Tabs.List>
  </RootWrapper>
);

runComponentConformance({
  name: 'Tabs.Root',
  element: <Tabs.Root />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
  renderPropTagName: 'div',
});

runComponentConformance({
  name: 'Tabs.List',
  element: <Tabs.List aria-label="Details" />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.list,
  renderPropTagName: 'div',
  wrapper: RootWrapper,
});

runComponentConformance({
  name: 'Tabs.Tab',
  element: <Tabs.Tab value="overview">Overview</Tabs.Tab>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.tab,
  renderPropTagName: 'button',
  wrapper: ListWrapper,
});

runComponentConformance({
  name: 'Tabs.Panel',
  element: <Tabs.Panel value="overview">Overview content</Tabs.Panel>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.panel,
  renderPropTagName: 'div',
  wrapper: RootWrapper,
});
