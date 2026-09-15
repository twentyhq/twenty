import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { Tabs } from '../Tabs';
import { type TabsListProps } from '../types/TabsListProps';
import { type TabsRootProps } from '../types/TabsRootProps';

type TabsKeyboardExampleProps = TabsListProps & {
  onValueChange?: TabsRootProps['onValueChange'];
};

const TabsKeyboardExample = ({
  onValueChange,
  ...props
}: TabsKeyboardExampleProps) => (
  <Tabs.Root defaultValue="overview" onValueChange={onValueChange}>
    <Tabs.List aria-label="Details" {...props}>
      <Tabs.Tab value="first" disabled>
        First
      </Tabs.Tab>
      <Tabs.Tab value="overview">Overview</Tabs.Tab>
      <Tabs.Tab value="files" disabled>
        Files
      </Tabs.Tab>
      <Tabs.Tab value="activity">Activity</Tabs.Tab>
      <Tabs.Tab value="last" disabled>
        Last
      </Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="overview">Overview content</Tabs.Panel>
    <Tabs.Panel value="activity">Activity content</Tabs.Panel>
  </Tabs.Root>
);

const meta: Meta<typeof TabsKeyboardExample> = {
  title: 'UI/Navigation/Tabs/Keyboard',
  component: TabsKeyboardExample,
  tags: ['!autodocs'],
  args: { onKeyDown: fn(), onValueChange: fn() },
};

export default meta;
type Story = StoryObj<typeof TabsKeyboardExample>;

export const DisabledEndpoints: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  },
};

export const NoLoop: Story = {
  decorators: [ComponentDecorator],
  args: { loopFocus: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await userEvent.keyboard('{End}{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveFocus();
  },
};

export const CancelWithPreventDefault: Story = {
  decorators: [ComponentDecorator],
  args: {
    onKeyDown: fn<NonNullable<TabsListProps['onKeyDown']>>((event) =>
      event.preventDefault(),
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onKeyDown).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  },
};

export const CancelWithPreventBaseUIHandler: Story = {
  ...CancelWithPreventDefault,
  args: {
    onKeyDown: fn<NonNullable<TabsListProps['onKeyDown']>>((event) =>
      event.preventBaseUIHandler(),
    ),
  },
};

export const ModifiedAndOffAxisKeys: Story = {
  decorators: [ComponentDecorator],
  args: { activateOnFocus: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard(
      '{Control>}{ArrowRight}{/Control}{Shift>}{End}{/Shift}{ArrowDown}',
    );
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await expect(
      canvas.getByRole('tabpanel', { name: 'Overview' }),
    ).toBeVisible();
  },
};

export const DisabledPolymorphicTab: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Tabs.Root defaultValue="overview">
      <Tabs.List aria-label="Details" activateOnFocus>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab
          value="files"
          disabled
          nativeButton={false}
          render={<a href="#files" aria-label="Files" />}
        >
          Files
        </Tabs.Tab>
        <Tabs.Tab
          value="activity"
          nativeButton={false}
          render={<a href="#activity" aria-label="Activity" />}
        >
          Activity
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">Overview content</Tabs.Panel>
      <Tabs.Panel value="activity">Activity content</Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toBeVisible();
  },
};

export const AllDisabled: Story = {
  decorators: [ComponentDecorator],
  render: (args) => (
    <>
      <button type="button">Before tabs</button>
      <Tabs.Root value="overview" onValueChange={args.onValueChange}>
        <Tabs.List aria-label="Details">
          <Tabs.Tab value="overview" disabled>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="activity" disabled>
            Activity
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview">Overview content</Tabs.Panel>
      </Tabs.Root>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Before tabs' }));
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}{Home}{End}{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  },
};

export const NestedTabs: Story = {
  decorators: [ComponentDecorator],
  render: (args) => (
    <Tabs.Root defaultValue="outer" onKeyDown={args.onKeyDown}>
      <Tabs.List aria-label="Outer">
        <Tabs.Tab value="outer">Outer</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="outer">
        <Tabs.Root defaultValue="inner">
          <Tabs.List aria-label="Inner" activateOnFocus>
            <Tabs.Tab value="inner">Inner</Tabs.Tab>
            <Tabs.Tab value="next">Next</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="inner">Inner content</Tabs.Panel>
          <Tabs.Panel value="next">Next content</Tabs.Panel>
        </Tabs.Root>
      </Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Inner' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Next' })).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: 'Outer' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(args.onKeyDown).toHaveBeenCalledTimes(1);
  },
};
