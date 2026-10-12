import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';

import { AutocompleteExample } from './AutocompleteExample';

const meta: Meta<typeof AutocompleteExample> = {
  title: 'UI/Input/Autocomplete',
  component: AutocompleteExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 280, height: 240 } },
};

export default meta;
type Story = StoryObj<typeof AutocompleteExample>;

export const Default: Story = {};

export const Documentation: Story = {};
