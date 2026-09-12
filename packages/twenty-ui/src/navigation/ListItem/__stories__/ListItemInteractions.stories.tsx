import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { ListItem } from '../ListItem';
import styles from '../ListItem.module.scss';
import { type ListItemProps } from '../types/ListItemProps';

const SelectableListItemExample = (props: ListItemProps) => {
  const [selected, setSelected] = useState(false);

  return (
    <ListItem
      {...props}
      selected={selected}
      focused={selected}
      color={selected ? 'danger' : 'neutral'}
      onClick={() => setSelected(!selected)}
      render={(renderProps, state) => (
        <div {...renderProps} data-render-highlighted={state.highlighted} />
      )}
    />
  );
};

const ActionListItemExample = (props: ListItemProps) => {
  const [deleted, setDeleted] = useState(false);

  return (
    <ListItem
      {...props}
      actions={
        <button type="button" onClick={() => setDeleted(true)}>
          Delete
        </button>
      }
    >
      {deleted ? 'Deleted' : 'Item'}
    </ListItem>
  );
};

const meta: Meta<typeof ListItem> = {
  title: 'UI/Navigation/ListItem/Interactions',
  component: ListItem,
  tags: ['!autodocs'],
  decorators: [
    ComponentDecorator,
    (Story) => (
      <div role="list">
        <Story />
      </div>
    ),
  ],
  parameters: { container: { width: 320 } },
  args: {
    children: 'Item',
    onClick: fn(),
    role: 'listitem',
    'aria-label': 'Item',
  },
};

export default meta;
type Story = StoryObj<typeof ListItem>;

export const ClickPropagation: Story = {
  play: async ({ canvasElement, args }) => {
    const onAncestorClick = fn();
    canvasElement.addEventListener('click', onAncestorClick);

    try {
      await userEvent.click(
        within(canvasElement).getByRole('listitem', { name: 'Item' }),
      );

      await expect(args.onClick).toHaveBeenCalledTimes(1);
      await expect(args.onClick).toHaveBeenCalledWith(
        expect.objectContaining({ defaultPrevented: false }),
      );
      await expect(onAncestorClick).toHaveBeenCalledTimes(1);
    } finally {
      canvasElement.removeEventListener('click', onAncestorClick);
    }
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const item = within(canvasElement).getByRole('listitem', { name: 'Item' });

    await userEvent.click(item);

    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(item).toHaveAttribute('aria-disabled', 'true');
    await expect(item).toHaveAttribute('data-disabled');
  },
};

export const DisabledLink: Story = {
  args: {
    disabled: true,
    role: 'link',
    render: <a href="#target" aria-label="Item link" />,
  },
  render: (args) => (
    <div role="listitem">
      <ListItem {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const item = within(canvasElement).getByRole('link');
    const onAncestorClick = fn();
    canvasElement.addEventListener('click', onAncestorClick);

    try {
      await userEvent.click(item);

      await expect(item).toHaveAttribute('href', '#target');
      await expect(args.onClick).not.toHaveBeenCalled();
      await expect(onAncestorClick).toHaveBeenCalledWith(
        expect.objectContaining({ defaultPrevented: true }),
      );
    } finally {
      canvasElement.removeEventListener('click', onAncestorClick);
    }
  },
};

export const ActionPropagation: Story = {
  render: (args) => <ActionListItemExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Delete', hidden: true });

    await userEvent.hover(canvas.getByRole('listitem', { name: 'Item' }));
    await userEvent.click(action);

    await expect(canvas.getByText('Deleted')).toBeVisible();
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const SelectionAndRenderState: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { indicator: 'check' },
  render: (args) => <SelectableListItemExample {...args} />,
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByRole('listitem', { name: 'Item' });

    await expect(item).not.toHaveAttribute('data-selected');
    await expect(item).not.toHaveAttribute('data-highlighted');
    await expect(item).not.toHaveAttribute('data-disabled');
    await expect(item).toHaveAttribute('data-color', 'neutral');
    await expect(item).toHaveAttribute('data-indicator', 'check');
    await expect(item.querySelector(`.${styles.checkIndicator}`)).toBeNull();

    await userEvent.click(item);

    await expect(item).toHaveAttribute('data-selected');
    await expect(item).toHaveAttribute('data-highlighted');
    await expect(item).toHaveAttribute('data-render-highlighted', 'true');
    await expect(item).toHaveAttribute('data-color', 'danger');
    await expect(item.querySelector(`.${styles.checkIndicator}`)).toBeVisible();
  },
};

export const DecorativeCheckbox: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { indicator: 'checkbox' },
  render: (args) => <SelectableListItemExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item = canvas.getByRole('listitem', { name: 'Item' });

    await expect(canvas.queryByRole('checkbox')).toBeNull();
    await expect(item.querySelector('[data-checked]')).toBeNull();

    await userEvent.click(item);

    await expect(canvas.queryByRole('checkbox')).toBeNull();
    await expect(item.querySelector('[data-checked]')).not.toBeNull();
  },
};
