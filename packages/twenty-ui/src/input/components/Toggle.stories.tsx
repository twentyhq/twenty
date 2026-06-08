import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ThemeProvider } from '@new-ui/theme-constants';

import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Input/Toggle',
  component: Toggle,
  args: { toggleSize: 'medium', 'aria-label': 'Example toggle' },
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const On: Story = { args: { value: true } };

export const Off: Story = { args: { value: false } };

export const Small: Story = { args: { value: true, toggleSize: 'small' } };

export const CustomColor: Story = {
  args: { value: true, color: 'color(display-p3 0.2 0.7 0.4)' },
};

export const Disabled: Story = { args: { value: true, disabled: true } };

const ControlledToggle = () => {
  const [value, setValue] = useState(false);
  return (
    <Toggle value={value} onChange={setValue} aria-label="Example toggle" />
  );
};

export const Interactive: Story = {
  render: () => <ControlledToggle />,
};

export const Dark: Story = {
  args: { value: true },
  decorators: [
    (Story) => (
      <ThemeProvider colorScheme="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
};
