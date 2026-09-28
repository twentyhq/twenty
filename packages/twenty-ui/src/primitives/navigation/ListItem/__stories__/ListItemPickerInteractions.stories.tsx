import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { ListItemPickerExample } from './ListItemPickerExample';

const meta: Meta<typeof ListItemPickerExample> = {
  title: 'UI/Navigation/ListItem/Picker interactions',
  component: ListItemPickerExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 280 } },
  args: { onSelectionChange: fn() },
};

export default meta;
type Story = StoryObj<typeof ListItemPickerExample>;

export const SingleSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const alex = canvas.getByRole('button', { name: 'Alex Morgan' });
    const sam = canvas.getByRole('button', { name: 'Sam Taylor' });

    await userEvent.click(alex);
    await expect(alex).toHaveAttribute('aria-pressed', 'true');
    sam.focus();
    await userEvent.keyboard('{Enter}');
    await expect(sam).toHaveAttribute('aria-pressed', 'true');
    await expect(alex).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onSelectionChange).toHaveBeenCalledTimes(2);
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith([
      'Sam Taylor',
    ]);
  },
};

export const MultipleSelection: Story = {
  args: { multiple: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const alex = canvas.getByRole('button', { name: 'Alex Morgan' });
    const sam = canvas.getByRole('button', { name: 'Sam Taylor' });
    const indicator = alex.querySelector('span[aria-hidden="true"]');

    await expect(indicator).not.toBeNull();
    await userEvent.click(indicator as HTMLElement);
    await expect(alex).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onSelectionChange).toHaveBeenCalledTimes(1);
    await userEvent.click(sam);
    alex.focus();
    await userEvent.keyboard(' ');
    await expect(alex).toHaveAttribute('aria-pressed', 'false');
    await expect(sam).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onSelectionChange).toHaveBeenCalledTimes(3);
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith([
      'Sam Taylor',
    ]);
    await expect(canvas.queryByRole('checkbox')).toBeNull();
  },
};

export const DisabledSelection: Story = {
  args: { multiple: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole('button', {
      name: 'Unavailable teammate',
    });

    await userEvent.click(disabled);
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onSelectionChange).not.toHaveBeenCalled();
    canvas.getByRole('button', { name: 'Sam Taylor' }).focus();
    await userEvent.tab();
    await expect(disabled).not.toHaveFocus();
  },
};
