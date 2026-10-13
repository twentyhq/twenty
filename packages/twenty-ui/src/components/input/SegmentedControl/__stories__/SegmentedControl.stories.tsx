import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconComment, IconHome } from '@ui/icon';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { SegmentedControl } from '../SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Input/SegmentedControl',
  component: SegmentedControl,
  decorators: [ComponentDecorator],
  args: {
    'aria-label': 'Billing period',
    defaultValue: 'annual',
    options: [
      { label: 'Annual', value: 'annual' },
      { label: 'Monthly', value: 'monthly' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const annual = canvas.getByRole('radio', { name: 'Annual' });
    const monthly = canvas.getByRole('radio', { name: 'Monthly' });
    const monthlyLabel = canvas.getByText('Monthly');

    await expect(annual).toBeChecked();
    await expect(annual.getBoundingClientRect().width).toBe(
      monthly.getBoundingClientRect().width,
    );
    await expect(monthlyLabel.scrollWidth).toBeLessThanOrEqual(
      monthlyLabel.clientWidth,
    );
  },
};

export const Documentation: Story = {};

export const Dark: Story = {
  globals: { colorScheme: 'dark' },
  play: Default.play,
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: 'Annual', value: 'annual' },
      { label: 'Monthly', value: 'monthly' },
      { disabled: true, label: 'Weekly', value: 'weekly' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const weekly = canvas.getByRole('radio', { name: 'Weekly' });

    await expect(weekly).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(weekly);
    await expect(weekly).not.toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Annual' })).toBeChecked();
  },
};

export const IconOnly: Story = {
  args: {
    'aria-label': 'Start page',
    defaultValue: 'home',
    options: [
      {
        startIcon: <IconHome />,
        'aria-label': 'Home',
        value: 'home',
      },
      {
        startIcon: <IconComment />,
        'aria-label': 'Chat',
        value: 'chat',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole('radio', { name: 'Home' });
    const chat = canvas.getByRole('radio', { name: 'Chat' });

    await expect(home).toBeChecked();
    await expect(chat).not.toBeChecked();
    await userEvent.click(chat);
    await expect(chat).toBeChecked();
    await expect(home).not.toBeChecked();
  },
};

export const ContentWidth: Story = {
  args: { itemWidth: 'content' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('radio', { name: 'Annual' }).getBoundingClientRect()
        .width,
    ).toBeLessThan(
      canvas.getByRole('radio', { name: 'Monthly' }).getBoundingClientRect()
        .width,
    );
  },
};

export const EqualWidth: Story = {
  args: { style: { width: 280 } },
  play: Default.play,
};

export const RightToLeft: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <SegmentedControl {...args} dir="rtl" />
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const annual = canvas.getByRole('radio', { name: 'Annual' });
    const monthly = canvas.getByRole('radio', { name: 'Monthly' });

    await userEvent.tab();
    await expect(annual).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(monthly).toHaveFocus());
    await expect(monthly).toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(annual).toBeChecked());
  },
};

export const RightToLeftDocumentation: Story = {
  render: RightToLeft.render,
};
