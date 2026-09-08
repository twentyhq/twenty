import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { Tabs } from '../Tabs';
import tabStyles from '../Tabs.module.scss';
import { type TabsListProps } from '../types/TabsListProps';
import { type TabsRootProps } from '../types/TabsRootProps';
import { type TabsTabProps } from '../types/TabsTabProps';

type TabsInteractionExampleProps = TabsRootProps & {
  activateOnFocus?: TabsListProps['activateOnFocus'];
  loopFocus?: TabsListProps['loopFocus'];
  keepMounted?: boolean;
  onTabClick?: TabsTabProps['onClick'];
};

const TabsInteractionExample = ({
  activateOnFocus,
  loopFocus,
  keepMounted,
  onTabClick,
  ...props
}: TabsInteractionExampleProps) => (
  <Tabs.Root defaultValue="overview" {...props}>
    <Tabs.List
      aria-label="Details"
      activateOnFocus={activateOnFocus}
      loopFocus={loopFocus}
    >
      <Tabs.Tab value="overview">Overview</Tabs.Tab>
      <Tabs.Tab value="files" disabled>
        Files
      </Tabs.Tab>
      <Tabs.Tab value="activity" onClick={onTabClick}>
        Activity
      </Tabs.Tab>
      <Tabs.Tab value="settings">Settings</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="overview" keepMounted={keepMounted}>
      <input aria-label="Draft" />
    </Tabs.Panel>
    <Tabs.Panel value="files" keepMounted={keepMounted}>
      Files content
    </Tabs.Panel>
    <Tabs.Panel value="activity" keepMounted={keepMounted}>
      Activity content
    </Tabs.Panel>
    <Tabs.Panel value="settings" keepMounted={keepMounted}>
      Settings content
    </Tabs.Panel>
  </Tabs.Root>
);

const ControlledTabsInteractionExample = ({
  onValueChange,
}: TabsInteractionExampleProps) => {
  const [value, setValue] = useState('overview');
  const [pendingValue, setPendingValue] = useState('overview');

  return (
    <>
      <TabsInteractionExample
        value={value}
        onValueChange={(nextValue, details) => {
          setPendingValue(nextValue);
          onValueChange?.(nextValue, details);
        }}
      />
      <button type="button" onClick={() => setValue(pendingValue)}>
        Apply selection
      </button>
    </>
  );
};

const meta: Meta<typeof TabsInteractionExample> = {
  title: 'UI/Navigation/Tabs/Interactions',
  component: TabsInteractionExample,
  tags: ['!autodocs'],
  args: { onValueChange: fn(), onTabClick: fn() },
};

export default meta;
type Story = StoryObj<typeof TabsInteractionExample>;

export const Uncontrolled: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const tab = canvas.getByRole('tab', { name: 'Activity' });
    await userEvent.click(tab);
    const panel = canvas.getByRole('tabpanel', { name: 'Activity' });
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(tab).toHaveAttribute('aria-controls', panel.id);
    await expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    await expect(panel).toHaveTextContent('Activity content');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'activity',
      expect.objectContaining({ reason: 'none' }),
    );
    await expect(args.onTabClick).toHaveBeenCalledTimes(1);
  },
};

export const Controlled: Story = {
  decorators: [ComponentDecorator],
  render: (args) => <ControlledTabsInteractionExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'activity',
      expect.anything(),
    );
    await expect(
      canvas.getByRole('tabpanel', { name: 'Overview' }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Apply selection' }),
    );
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toBeVisible();
  },
};

export const ManualKeyboardActivation: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    await expect(
      canvas.getByRole('tabpanel', { name: 'Overview' }),
    ).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toBeVisible();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(
      canvas.getByRole('tabpanel', { name: 'Settings' }),
    ).toBeVisible();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  },
};

export const AutomaticKeyboardActivation: Story = {
  decorators: [ComponentDecorator],
  args: { activateOnFocus: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'activity',
      expect.anything(),
    );
  },
};

export const DisabledActivation: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const disabledTab = canvas.getByRole('tab', { name: 'Files' });
    await expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(disabledTab);
    disabledTab.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(
      canvas.getByRole('tabpanel', { name: 'Overview' }),
    ).toBeVisible();
  },
};

export const VerticalNavigation: Story = {
  decorators: [ComponentDecorator],
  args: { orientation: 'vertical', activateOnFocus: true, loopFocus: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('tablist', { name: 'Details' }),
    ).toHaveAttribute('aria-orientation', 'vertical');
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toBeVisible();
    await userEvent.keyboard('{End}{ArrowDown}');
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await userEvent.keyboard('{Home}{ArrowUp}');
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  },
};

export const RightToLeftNavigation: Story = {
  decorators: [ComponentDecorator],
  args: { activateOnFocus: true, dir: 'rtl' },
  render: (args) => (
    <DirectionProvider direction="rtl">
      <TabsInteractionExample {...args} />
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowLeft}');
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toBeVisible();
  },
};

export const UnmountedPanels: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const draft = canvas.getByRole('textbox', { name: 'Draft' });
    await userEvent.type(draft, 'Draft text');
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await waitFor(() => expect(draft).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await expect(canvas.getByRole('textbox', { name: 'Draft' })).toHaveValue(
      '',
    );
  },
};

export const KeptPanels: Story = {
  decorators: [ComponentDecorator],
  args: { keepMounted: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const tab of canvas.getAllByRole('tab')) {
      const panel = canvas
        .getAllByRole('tabpanel', { hidden: true })
        .find((element) => element.id === tab.getAttribute('aria-controls'));
      await expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    }
    const panel = canvas.getByRole('tabpanel', { name: 'Overview' });
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Draft' }),
      'Saved draft',
    );
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await waitFor(() => expect(panel).not.toBeVisible());
    await expect(panel).toHaveAttribute('inert');
    await expect(panel).toHaveAttribute('tabindex', '-1');
    await expect(
      canvas.queryByRole('textbox', { name: 'Draft' }),
    ).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toHaveFocus();
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }));
    await expect(canvas.getByRole('textbox', { name: 'Draft' })).toHaveValue(
      'Saved draft',
    );
  },
};

export const NoSelection: Story = {
  decorators: [ComponentDecorator],
  args: { value: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('tabpanel')).not.toBeInTheDocument();
    await expect(canvas.getAllByRole('tab', { selected: false })).toHaveLength(
      4,
    );
  },
};

export const SlotsAndStateStyling: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Tabs.Root defaultValue="overview">
      <Tabs.List aria-label="Details">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab
          value="activity"
          size="md"
          startIcon={<svg data-testid="icon" />}
          badge={0}
          className={({ active }) =>
            active ? 'selected-consumer' : 'consumer'
          }
          style={({ active }) => ({ marginInlineStart: active ? 7 : 3 })}
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
    const tab = canvas.getByRole('tab', { name: /Activity\s*0/ });
    await expect(canvas.getByTestId('icon').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(tab).toHaveClass(tabStyles.tab, 'consumer');
    await expect(tab).toHaveStyle({ marginInlineStart: '3px' });
    await expect(tab).toHaveAttribute('data-size', 'md');
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'data-size',
      'sm',
    );
    await userEvent.click(tab);
    await expect(tab).toHaveClass(tabStyles.tab, 'selected-consumer');
    await expect(tab).toHaveStyle({ marginInlineStart: '7px' });
  },
};

export const EmptySlots: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Tabs.Root value={null}>
      <Tabs.List aria-label="Empty adornments">
        {[undefined, null, false, true, ''].map((slot, index) => (
          <Tabs.Tab key={index} value={index} badge={slot} startIcon={slot}>
            Tab {index + 1}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const tab of canvas.getAllByRole('tab')) {
      await expect(tab.querySelector(`.${tabStyles.badge}`)).toBeNull();
      await expect(tab.querySelector(`.${tabStyles.startIcon}`)).toBeNull();
    }
  },
};

export const PolymorphicTab: Story = {
  decorators: [ComponentDecorator],
  args: {
    onTabClick: fn<NonNullable<TabsTabProps['onClick']>>((event) =>
      event.preventDefault(),
    ),
  },
  render: (args) => (
    <Tabs.Root defaultValue="overview">
      <Tabs.List aria-label="Details">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab
          value="activity"
          nativeButton={false}
          render={<a href="#activity" aria-label="Activity" />}
          onClick={args.onTabClick}
        >
          Activity
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">Overview content</Tabs.Panel>
      <Tabs.Panel value="activity">Activity content</Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tab = canvas.getByRole('tab', { name: 'Activity' });
    await expect(tab.tagName).toBe('A');
    await expect(tab).toHaveAttribute('href', '#activity');
    await userEvent.click(tab);
    await expect(args.onTabClick).toHaveBeenCalledTimes(1);
    await expect(
      canvas.getByRole('tabpanel', { name: 'Activity' }),
    ).toBeVisible();
  },
};
