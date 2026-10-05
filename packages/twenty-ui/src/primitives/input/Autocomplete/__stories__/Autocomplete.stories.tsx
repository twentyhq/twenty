import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', {
      name: 'Fruit',
    });
    await userEvent.type(input, 'Ch');
    const option = await within(canvasElement.ownerDocument.body).findByRole(
      'option',
      { name: 'Cherry' },
    );
    await expect(input).toHaveFocus();
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-activedescendant', option.id),
    );
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Cherry');
    await expect(input).toHaveFocus();
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );
  },
};

export const Documentation: Story = {};
