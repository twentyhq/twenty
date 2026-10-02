import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CurrencyPickerExample } from './CurrencyPickerExample';
import { openCurrencyPicker } from './openCurrencyPicker';

const meta: Meta<typeof CurrencyPickerExample> = {
  title: 'UI/Input/CurrencyPicker',
  component: CurrencyPickerExample,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 320, height: 340 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
};

export default meta;
type Story = StoryObj<typeof CurrencyPickerExample>;

export const Documentation: Story = {};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const { dialog } = await openCurrencyPicker({ canvasElement });

    await expect(
      within(dialog).getByRole('button', { name: 'US Dollar (USD)' }),
    ).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Dark: Story = {
  ...Default,
  globals: { colorScheme: 'dark' },
};

export const RightToLeft: Story = {
  ...Default,
  args: { dir: 'rtl' },
};
