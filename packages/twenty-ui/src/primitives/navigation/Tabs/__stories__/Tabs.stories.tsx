import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { IconInfoCircle } from '@ui/icon';
import { Input } from '@ui/primitives/input/Input/Input';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
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
      <Tabs.Indicator />
    </Tabs.List>
    <Tabs.Panel
      value="overview"
      className={styles.panel}
      keepMounted={keepMounted}
    >
      {keepMounted ? (
        <Input aria-label="Draft note" placeholder="Write a note" />
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

export const Display: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
};

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

export const Compact: Story = {
  ...Display,
  args: { size: 'compact' },
  render: ({ size }) => (
    <Tabs.Root defaultValue="output">
      <Tabs.List aria-label="Tool call details">
        <Tabs.Tab value="output" size={size}>
          Output
        </Tabs.Tab>
        <Tabs.Tab value="input" size={size}>
          Input
        </Tabs.Tab>
        <Tabs.Indicator data-testid="compact-indicator" />
      </Tabs.List>
      <Tabs.Panel value="output">Saved output</Tabs.Panel>
      <Tabs.Panel value="input">Saved input</Tabs.Panel>
    </Tabs.Root>
  ),
};

export const CompactInteractions: Story = {
  ...Compact,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const output = canvas.getByRole('tab', { name: 'Output' });
    const input = canvas.getByRole('tab', { name: 'Input' });
    const indicator = canvas.getByTestId('compact-indicator');

    for (const tab of [output, input]) {
      await expect(tab).toHaveAttribute('data-size', 'compact');
      await expect(getComputedStyle(tab).minBlockSize).toBe('24px');
      await expect(tab.getBoundingClientRect().height).toBeGreaterThanOrEqual(
        24,
      );
      await expect(tab.getBoundingClientRect().height).toBeLessThan(40);
      await expect(tab.firstElementChild).toHaveStyle({ padding: '4px' });
    }
    await userEvent.click(output);
    await userEvent.keyboard('{ArrowRight}');
    await expect(input).toHaveFocus();
    await expect(output).toHaveAttribute('aria-selected', 'true');
    await expect(
      canvas.getByRole('tabpanel', { name: 'Output' }),
    ).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-selected', 'true');
      expect(canvas.getByRole('tabpanel', { name: 'Input' })).toHaveTextContent(
        'Saved input',
      );
      expect(indicator.getBoundingClientRect().width).toBeCloseTo(
        input.getBoundingClientRect().width,
        0,
      );
      expect(indicator.getBoundingClientRect().left).toBeCloseTo(
        input.getBoundingClientRect().left,
        0,
      );
    });
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

export const Highlighted: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  args: { highlighted: true },
  render: (args) => (
    <TabsExample tabProps={args} rootProps={{ defaultValue: 'activity' }} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });

    expect(overview).toHaveAttribute('aria-selected', 'false');
    expect(canvas.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
    await userEvent.click(overview);
    expect(canvas.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
  },
};

export const IconOnly: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  args: {
    'aria-label': 'Overview',
    children: undefined,
    startIcon: <IconInfoCircle />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(
      canvas.getByRole('tabpanel', { name: 'Overview' }),
    ).toHaveTextContent('Record overview');
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
    const overviewPanel = canvas.getByRole('tabpanel', { name: 'Overview' });
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Draft note' }),
      'A saved draft',
    );
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await waitFor(() => expect(overviewPanel).not.toBeVisible());
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

const ACTIVITY_LOG_ENTRIES = Array.from(
  { length: 12 },
  (_, index) => `Activity entry ${index + 1}`,
);

export const FixedHeight: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  args: { value: 'activity', children: 'Activity' },
  render: (args) => (
    <Tabs.Root defaultValue="activity" className={styles.fixedHeightRoot}>
      <Tabs.List aria-label="Record details">
        <Tabs.Tab {...args} />
        <Tabs.Tab value="notes">Notes</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="activity" className={styles.scrollingPanel}>
        <div
          role="region"
          aria-label="Activity log"
          tabIndex={0}
          className={styles.scrollArea}
        >
          {ACTIVITY_LOG_ENTRIES.map((entry) => (
            <p key={entry}>{entry}</p>
          ))}
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="notes" className={styles.panel}>
        Record notes
      </Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const activityLog = canvas.getByRole('region', { name: 'Activity log' });

    await expect(activityLog.scrollHeight).toBeGreaterThan(
      activityLog.clientHeight,
    );

    activityLog.scrollTop = activityLog.scrollHeight;

    await waitFor(() => expect(activityLog.scrollTop).toBeGreaterThan(0));
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
  badge: {
    badge: <Tag color="gray">3</Tag>,
  },
};

export const Catalog: CatalogStory<Story, typeof Tabs.Tab> = {
  decorators: [CatalogDecorator],
  render: (args) => (
    <Tabs.Root value={args.value === 'selected' ? 'selected' : null}>
      <Tabs.List aria-label="Record details">
        <Tabs.Tab {...args} />
        <Tabs.Indicator />
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
          values: ['compact', 'sm', 'md'] satisfies TabsSize[],
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
