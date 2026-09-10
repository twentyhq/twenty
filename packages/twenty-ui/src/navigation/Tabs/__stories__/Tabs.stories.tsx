import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { IconInfoCircle } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Tabs } from '../Tabs';
import { type TabsListProps } from '../types/TabsListProps';
import { type TabsRootProps } from '../types/TabsRootProps';
import { type TabsSize } from '../types/TabsSize';
import { type TabsTabProps } from '../types/TabsTabProps';

import styles from './Tabs.stories.module.scss';

type TabsExampleProps = {
  tabProps: TabsTabProps;
  rootProps?: TabsRootProps;
  listProps?: TabsListProps;
  keepMounted?: boolean;
};

const TabsExample = ({
  tabProps,
  rootProps,
  listProps,
  keepMounted,
}: TabsExampleProps) => (
  <Tabs.Root defaultValue="overview" {...rootProps}>
    <Tabs.List aria-label="Record details" {...listProps}>
      <Tabs.Tab {...tabProps} />
      <Tabs.Tab value="activity">Activity</Tabs.Tab>
      <Tabs.Tab value="settings">Settings</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel
      value="overview"
      className={styles.panel}
      keepMounted={keepMounted}
    >
      {keepMounted ? (
        <input aria-label="Draft note" placeholder="Write a note" />
      ) : (
        'Record overview'
      )}
    </Tabs.Panel>
    <Tabs.Panel
      value="activity"
      className={styles.panel}
      keepMounted={keepMounted}
    >
      Recent activity
    </Tabs.Panel>
    <Tabs.Panel
      value="settings"
      className={styles.panel}
      keepMounted={keepMounted}
    >
      Record settings
    </Tabs.Panel>
  </Tabs.Root>
);

const ControlledTabsExample = ({ tabProps }: { tabProps: TabsTabProps }) => {
  const [value, setValue] = useState('overview');

  return (
    <TabsExample
      tabProps={tabProps}
      rootProps={{ value, onValueChange: setValue }}
    />
  );
};

const meta: Meta<typeof Tabs.Tab> = {
  title: 'UI/Navigation/Tabs',
  component: Tabs.Tab,
  args: { value: 'overview', children: 'Overview' },
  render: (args) => <TabsExample tabProps={args} />,
};

export default meta;

type Story = StoryObj<typeof Tabs.Tab>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toHaveTextContent('Recent activity');
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('tabpanel', { name: 'Settings' }),
    ).toHaveTextContent('Record settings');
  },
};

export const Controlled: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  render: (args) => <ControlledTabsExample tabProps={args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toBeVisible();
  },
};

export const AutomaticActivation: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  render: (args) => (
    <TabsExample tabProps={args} listProps={{ activateOnFocus: true }} />
  ),
};

export const WithIconAndBadge: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  args: {
    startIcon: <IconInfoCircle />,
    badge: <span className={styles.count}>3</span>,
  },
};

export const Disabled: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  args: { disabled: true },
  render: (args) => (
    <TabsExample tabProps={args} rootProps={{ defaultValue: 'activity' }} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Settings' }));
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveFocus();
  },
};

export const Vertical: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  render: (args) => (
    <TabsExample tabProps={args} rootProps={{ orientation: 'vertical' }} />
  ),
};

export const KeepMounted: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  render: (args) => <TabsExample tabProps={args} keepMounted />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Draft note' }),
      'A saved draft',
    );
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await userEvent.tab();
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toHaveFocus();
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await expect(
      canvas.getByRole('textbox', { name: 'Draft note' }),
    ).toHaveValue('A saved draft');
  },
};

export const RightToLeft: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 300 } },
  render: (args) => (
    <DirectionProvider direction="rtl">
      <TabsExample tabProps={args} rootProps={{ dir: 'rtl' }} />
    </DirectionProvider>
  ),
};

type TabsCatalogState = 'default' | 'hover' | 'focus' | 'selected' | 'disabled';

const TABS_CATALOG_STATE_PROPS: Record<
  TabsCatalogState,
  Partial<TabsTabProps>
> = {
  default: {},
  hover: { className: 'hover' },
  focus: { className: 'focus' },
  selected: { value: 'selected' },
  disabled: { disabled: true },
};

type TabsCatalogContent = 'plain' | 'icon' | 'badge';

const TABS_CATALOG_CONTENT_PROPS: Record<
  TabsCatalogContent,
  Partial<TabsTabProps>
> = {
  plain: {},
  icon: { startIcon: <IconInfoCircle /> },
  badge: { badge: <span className={styles.count}>3</span> },
};

export const Catalog: CatalogStory<Story, typeof Tabs.Tab> = {
  decorators: [CatalogDecorator],
  render: (args) => (
    <Tabs.Root value={args.value === 'selected' ? 'selected' : null}>
      <Tabs.List aria-label="Record details">
        <Tabs.Tab {...args} />
      </Tabs.List>
      <Tabs.Panel value={args.value} keepMounted />
    </Tabs.Root>
  ),
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], focus: ['.focus'], focusVisible: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'size',
          values: ['sm', 'md'] satisfies TabsSize[],
          props: (size: TabsSize) => ({ size }),
        },
        {
          name: 'state',
          values: [
            'default',
            'hover',
            'focus',
            'selected',
            'disabled',
          ] satisfies TabsCatalogState[],
          props: (state: TabsCatalogState) => TABS_CATALOG_STATE_PROPS[state],
        },
        {
          name: 'content',
          values: ['plain', 'icon', 'badge'] satisfies TabsCatalogContent[],
          props: (content: TabsCatalogContent) =>
            TABS_CATALOG_CONTENT_PROPS[content],
        },
      ],
      options: { elementContainer: { style: { width: 180 } } },
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof Tabs.Tab> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
