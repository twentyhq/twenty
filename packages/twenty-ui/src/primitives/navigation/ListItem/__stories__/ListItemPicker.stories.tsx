import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { ListItemPickerExample } from './ListItemPickerExample';

const meta: Meta<typeof ListItemPickerExample> = {
  title: 'UI/Navigation/ListItem/Picker',
  component: ListItemPickerExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 280 } },
};

export default meta;
type Story = StoryObj<typeof ListItemPickerExample>;

export const SingleSelection: Story = {};

export const MultipleSelection: Story = {
  args: { multiple: true },
};

export const MultipleSelectionDark: Story = {
  ...MultipleSelection,
  globals: { colorScheme: 'dark' },
};
