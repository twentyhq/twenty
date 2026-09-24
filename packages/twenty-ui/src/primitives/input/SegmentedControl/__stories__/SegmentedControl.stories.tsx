import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconComment, IconHome } from '@ui/icon';
import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { SegmentedControl } from '../SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'UI/Input/SegmentedControl',
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
    const monthlyLabel = canvas.getByText('Monthly');

    await expect(
      canvas.getByRole('radio', { name: 'Annual' }).getBoundingClientRect()
        .width,
    ).toBe(
      canvas.getByRole('radio', { name: 'Monthly' }).getBoundingClientRect()
        .width,
    );
    await expect(monthlyLabel.scrollWidth).toBeLessThanOrEqual(
      monthlyLabel.clientWidth,
    );
  },
};

export const Dark: Story = {
  globals: { colorScheme: 'dark' },
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: 'Annual', value: 'annual' },
      { label: 'Monthly', value: 'monthly' },
      { disabled: true, label: 'Weekly', value: 'weekly' },
    ],
  },
};

export const IconOnly: Story = {
  args: {
    'aria-label': 'Start page',
    defaultValue: 'home',
    options: [
      {
        startIcon: <IconHome data-testid="direct-icon" />,
        'aria-label': 'Home',
        value: 'home',
      },
      {
        startIcon: (
          <span>
            <IconComment data-testid="wrapped-icon" />
          </span>
        ),
        'aria-label': 'Chat',
        value: 'chat',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole('radio', { name: 'Home' });
    const chat = canvas.getByRole('radio', { name: 'Chat' });
    const directIcon = canvas.getByTestId('direct-icon');
    const directIconBounds = directIcon.getBoundingClientRect();
    const wrappedIconBounds = canvas
      .getByTestId('wrapped-icon')
      .getBoundingClientRect();

    await expect(directIcon.parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(directIconBounds.width).toBeGreaterThan(0);
    await expect(wrappedIconBounds.width).toBe(directIconBounds.width);
    await expect(wrappedIconBounds.height).toBe(directIconBounds.height);
    await expect(home).toBeChecked();
    await expect(chat).not.toBeChecked();
    await userEvent.click(chat);
    await expect(chat).toBeChecked();
    await expect(home).not.toBeChecked();
  },
};

export const ContentWidth: Story = {
  args: { itemWidth: 'content' },
};

export const EqualWidth: Story = {
  args: { style: { width: 280 } },
};

export const RightToLeft: Story = {
  render: (args) => (
    <TextDirectionProvider direction="rtl">
      <SegmentedControl {...args} dir="rtl" />
    </TextDirectionProvider>
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
