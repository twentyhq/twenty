import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { CountrySelectExample } from './CountrySelectExample';

const meta: Meta<typeof CountrySelectExample> = {
  title: 'UI/Input/CountrySelect',
  component: CountrySelectExample,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 280, height: 220 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
};

export default meta;
type Story = StoryObj<typeof CountrySelectExample>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Empty: Story = {
  args: { value: '' },
};

export const ScopedTheme: Story = {
  args: { value: 'Japan', label: 'Scoped country' },
  render: (args) => (
    <ThemeProvider colorScheme="dark" applyToRoot={false}>
      <div style={{ background: 'var(--t-background-primary)', padding: 16 }}>
        <CountrySelectExample {...args} />
      </div>
    </ThemeProvider>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Scoped country',
    });

    expect(trigger).toHaveTextContent('Japon');
  },
};
