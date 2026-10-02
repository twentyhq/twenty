import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CurrencyPickerExample } from './CurrencyPickerExample';
import { openCurrencyPicker } from './openCurrencyPicker';

const meta: Meta<typeof CurrencyPickerExample> = {
  title: 'UI/Input/CurrencyPicker/Locale',
  component: CurrencyPickerExample,
  render: (args) => <CurrencyPickerExample key={args.defaultValue} {...args} />,
  decorators: [ComponentDecorator],
  args: { onValueChange: fn() },
  parameters: {
    container: { width: 320, height: 340 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
};

export default meta;
type Story = StoryObj<typeof CurrencyPickerExample>;

export const CaseInsensitiveSearch: Story = {
  args: {
    currencies: [
      { code: 'INR', name: 'Indian Rupee' },
      { code: 'IDR', name: 'Indonesian Rupiah' },
      { code: 'USD', name: 'US Dollar' },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const firstPicker = await openCurrencyPicker({ canvasElement });

    await userEvent.type(firstPicker.search, 'indian');
    await expect(
      within(firstPicker.dialog).getByRole('button', {
        name: 'Indian Rupee (INR)',
      }),
    ).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(firstPicker.dialog).not.toBeInTheDocument());
    await expect(args.onValueChange).toHaveBeenLastCalledWith('INR');

    const secondPicker = await openCurrencyPicker({ canvasElement });

    await userEvent.type(secondPicker.search, 'idr');
    await expect(
      within(secondPicker.dialog).getByRole('button', {
        name: 'Indonesian Rupiah (IDR)',
      }),
    ).toBeVisible();
    await userEvent.clear(secondPicker.search);
    await userEvent.type(secondPicker.search, 'IDR');
    await expect(
      within(secondPicker.dialog).getByRole('button', {
        name: 'Indonesian Rupiah (IDR)',
      }),
    ).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(secondPicker.dialog).not.toBeInTheDocument());
    await expect(args.onValueChange).toHaveBeenLastCalledWith('IDR');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
  },
};
