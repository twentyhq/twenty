import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { AutocompleteGridExample } from './AutocompleteGridExample';
import { AutocompletePositionedExample } from './AutocompletePositionedExample';

const meta: Meta<typeof AutocompletePositionedExample> = {
  title: 'UI/Input/Autocomplete/Positioning',
  component: AutocompletePositionedExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 340, height: 320 } },
};

export default meta;
type Story = StoryObj<typeof AutocompletePositionedExample>;

export const ExplicitDestination: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Fruit' });
    const destination = canvas.getByRole('region', {
      name: 'Suggestion destination',
    });
    const portal = within(destination).getByTestId('suggestion-portal');
    const positioner = within(portal).getByTestId('suggestion-positioner');
    const popup = within(positioner).getByTestId('suggestion-popup');

    await expect(
      within(portal).getByTestId('suggestion-backdrop'),
    ).toBeInTheDocument();
    await expect(popup.tagName).toBe('SECTION');
    await expect(input).toHaveAttribute('data-composed-input', 'true');
    await waitFor(() => expect(popup).toBeVisible());
    await expect(positioner).toHaveAttribute('data-side', 'bottom');
    await expect(positioner).toHaveAttribute('data-align', 'end');
    await expect(positioner).toHaveStyle({ position: 'fixed' });
    await waitFor(() => {
      const anchorBounds = input.getBoundingClientRect();
      const popupBounds = popup.getBoundingClientRect();
      expect(Math.abs(popupBounds.width - 180)).toBeLessThan(1);
      expect(Math.abs(popupBounds.right - anchorBounds.right)).toBeLessThan(1);
      expect(
        Math.abs(
          popupBounds.top - anchorBounds.bottom - anchorBounds.height / 2,
        ),
      ).toBeLessThan(1);
    });
    await userEvent.click(input);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(portal).toBeInTheDocument();
    await expect(input).toHaveFocus();
  },
};

export const InlineGrid: Story = {
  render: () => <AutocompleteGridExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Fruit grid' });
    await expect(canvas.getByRole('grid')).toBeVisible();
    await expect(canvas.getAllByRole('row')).toHaveLength(2);
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Suggestions: 4',
    );
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute(
      'aria-activedescendant',
      canvas.getByRole('gridcell', { name: 'Cherry' }).id,
    );
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Cherry');
    await expect(canvas.getByRole('grid')).toBeVisible();
  },
};
