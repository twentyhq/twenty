import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CurrencyPickerExample } from './CurrencyPickerExample';
import { openCurrencyPicker } from './openCurrencyPicker';

const meta: Meta<typeof CurrencyPickerExample> = {
  id: 'ui-input-currencypicker',
  title: 'UI/Components/Input/CurrencyPicker',
  component: CurrencyPickerExample,
  render: (args) => <CurrencyPickerExample key={args.defaultValue} {...args} />,
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
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <Story />
      </DirectionProvider>
    ),
  ],
};
