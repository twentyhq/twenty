import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { AutocompleteFilteredExample } from './AutocompleteFilteredExample';
import { AutocompleteGroupedExample } from './AutocompleteGroupedExample';

const meta: Meta<typeof AutocompleteGroupedExample> = {
  title: 'UI/Input/Autocomplete/Collections',
  component: AutocompleteGroupedExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 340, height: 340 } },
};

export default meta;
type Story = StoryObj<typeof AutocompleteGroupedExample>;

export const GroupedObjects: Story = {};

export const GroupedObjectInteractions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox', { name: 'City' });

    await userEvent.click(canvas.getByRole('button', { name: 'Show cities' }));
    await body.findByRole('option', { name: 'Paris France' });
    await waitFor(() => {
      expect(body.getByText('Western Europe')).toBeVisible();
      expect(body.getByText('Central Europe')).toBeVisible();
    });
    await userEvent.type(input, 'li');
    const lisbon = await body.findByRole('option', { name: 'Lisbon Portugal' });
    const berlin = body.getByRole('option', { name: 'Berlin Germany' });
    await expect(
      body.queryByRole('option', { name: 'Paris France' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-activedescendant', lisbon.id),
    );
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant', berlin.id);
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Berlin');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'City query: Berlin',
    );
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear city' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'Tokyo');
    await expect(await body.findByText('No matching cities')).toBeVisible();
  },
};

export const ExternalFiltering: Story = {
  render: () => <AutocompleteFilteredExample />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', {
      name: 'City prefix',
    });
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.type(input, 'ri');
    await expect(
      await body.findByText('No city starts with this query'),
    ).toBeVisible();
    await expect(
      body.queryByRole('option', { name: 'Paris' }),
    ).not.toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, 'Pa');
    const paris = await body.findByRole('option', { name: 'Paris' });
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-activedescendant', paris.id),
    );
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Paris');
  },
};
