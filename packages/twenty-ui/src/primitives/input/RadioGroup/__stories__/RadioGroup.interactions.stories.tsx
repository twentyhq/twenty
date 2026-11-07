import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Radio } from '@ui/primitives/input/Radio/Radio';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { RadioGroup } from '../RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Input/RadioGroup/Interactions',
  component: RadioGroup,
  args: {
    'aria-label': 'Billing frequency',
    name: 'billingFrequency',
    defaultValue: 'monthly',
    children: (
      <>
        <Radio value="monthly">Monthly</Radio>
        <Radio value="yearly">Yearly</Radio>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Billing frequency' });
    const monthly = canvas.getByRole('radio', { name: 'Monthly' });
    const yearly = canvas.getByRole('radio', { name: 'Yearly' });

    await expect(group).toHaveAttribute('data-orientation', 'vertical');
    await expect(group).not.toHaveAttribute('aria-orientation');
    await expect(group).not.toHaveAttribute('orientation');
    await expect(yearly.getBoundingClientRect().top).toBeGreaterThan(
      monthly.getBoundingClientRect().bottom,
    );
  },
};

export const Horizontal: Story = {
  ...Default,
  args: { orientation: 'horizontal', onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Billing frequency' });
    const monthly = canvas.getByRole('radio', { name: 'Monthly' });
    const yearly = canvas.getByRole('radio', { name: 'Yearly' });
    const expectedDirection = args.dir ?? 'ltr';
    const isRightToLeft = expectedDirection === 'rtl';
    const monthlyBounds = monthly.getBoundingClientRect();
    const yearlyBounds = yearly.getBoundingClientRect();
    const leftRadioBounds = isRightToLeft ? yearlyBounds : monthlyBounds;
    const rightRadioBounds = isRightToLeft ? monthlyBounds : yearlyBounds;

    await expect(getComputedStyle(group).direction).toBe(expectedDirection);
    await expect(group).toHaveAttribute('data-orientation', 'horizontal');
    await expect(group).not.toHaveAttribute('aria-orientation');
    await expect(group).not.toHaveAttribute('orientation');
    await expect(yearlyBounds.top).toBe(monthlyBounds.top);
    await expect(rightRadioBounds.left).toBeGreaterThan(leftRadioBounds.right);
    await userEvent.click(monthly);
    await userEvent.keyboard(isRightToLeft ? '{ArrowLeft}' : '{ArrowRight}');
    await waitFor(() => {
      expect(yearly).toHaveFocus();
      expect(yearly).toBeChecked();
    });
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(monthly).toHaveFocus();
      expect(monthly).toBeChecked();
    });
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
  },
};

export const HorizontalRightToLeft: Story = {
  ...Horizontal,
  args: { ...Horizontal.args, dir: 'rtl' },
  decorators: [
    ComponentDecorator,
    (Story) => (
      <DirectionProvider direction="rtl">
        <Story />
      </DirectionProvider>
    ),
  ],
};
