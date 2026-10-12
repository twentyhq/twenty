import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IconEdit, IconTrash } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { ListItem } from '../ListItem';
import styles from '../ListItem.module.scss';
import { type ListItemProps } from '../types/ListItemProps';

import { ListItemMenuExample } from './ListItemMenuExample';

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
        <button
          {...renderProps}
          type="button"
          aria-pressed={selected}
          data-render-highlighted={state.highlighted}
        />
      )}
    />
  );
};

const ActionListItemExample = (props: ListItemProps) => {
  const [deleted, setDeleted] = useState(false);

  return (
    <ListItem
      {...props}
      data-testid="list-item"
      actions={
        <Button variant="ghost" size="sm" onClick={() => setDeleted(true)}>
          Delete
        </Button>
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
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320 } },
  args: {
    children: 'Item',
    onClick: fn(),
  },
  render: (args) => <ListItem {...args} data-testid="list-item" />,
};

export default meta;
type Story = StoryObj<typeof ListItem>;

export const PresentationalRow: Story = {
  args: { selected: true, focused: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item = canvas.getByTestId('list-item');

    await expect(item.tagName).toBe('DIV');
    await expect(item).not.toHaveAttribute('role');
    await expect(item).not.toHaveAttribute('tabindex');
    await expect(item).toHaveAttribute('data-selected');
    await expect(item).toHaveAttribute('data-highlighted');
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(item).not.toHaveFocus();
  },
};

export const ClickPropagation: Story = {
  args: { ref: fn(), onPointerDown: fn() },
  play: async ({ canvasElement, args }) => {
    const item = within(canvasElement).getByTestId('list-item');
    const onAncestorClick = fn();
    const ancestor = canvasElement.ownerDocument.body;
    ancestor.addEventListener('click', onAncestorClick);

    try {
      await userEvent.click(item);

      await expect(args.ref).toHaveBeenCalledWith(item);
      await expect(args.onPointerDown).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'pointerdown', pointerType: 'mouse' }),
      );
      await expect(args.onClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          bubbles: true,
          defaultPrevented: false,
          target: item,
        }),
      );
      await expect(onAncestorClick).toHaveBeenCalledTimes(1);
    } finally {
      ancestor.removeEventListener('click', onAncestorClick);
    }
  },
};

export const CallerPropagationPolicy: Story = {
  args: {
    onClick: fn<NonNullable<ListItemProps['onClick']>>((event) =>
      event.stopPropagation(),
    ),
  },
  play: async ({ canvasElement, args }) => {
    const onAncestorClick = fn();
    const ancestor = canvasElement.ownerDocument.body;
    ancestor.addEventListener('click', onAncestorClick);

    try {
      await userEvent.click(within(canvasElement).getByTestId('list-item'));

      await expect(args.onClick).toHaveBeenCalledTimes(1);
      await expect(onAncestorClick).not.toHaveBeenCalled();
    } finally {
      ancestor.removeEventListener('click', onAncestorClick);
    }
  },
};

export const DisabledAppearance: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const item = within(canvasElement).getByTestId('list-item');

    await userEvent.click(item);

    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(item).not.toHaveAttribute('aria-disabled');
    await expect(item).toHaveAttribute('data-disabled');
  },
};

export const DisabledButtonOwner: Story = {
  args: {
    disabled: true,
    render: <button type="button" disabled />,
    ref: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const item = within(canvasElement).getByRole('button', { name: 'Item' });

    await expect(args.ref).toHaveBeenCalledWith(item);
    await expect(item).toBeDisabled();
    await userEvent.click(item);
    await userEvent.tab();
    await expect(item).not.toHaveFocus();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const ActionPropagation: Story = {
  render: (args) => <ActionListItemExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Delete' });

    await userEvent.hover(canvas.getByTestId('list-item'));
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
    const item = within(canvasElement).getByRole('button', { name: 'Item' });

    await expect(item).not.toHaveAttribute('data-selected');
    await expect(item).not.toHaveAttribute('data-highlighted');
    await expect(item).not.toHaveAttribute('data-disabled');
    await expect(item).toHaveAttribute('data-color', 'neutral');
    await expect(item).toHaveAttribute('data-indicator', 'check');
    await expect(item.querySelector(`.${styles.checkIndicator}`)).toBeNull();

    await userEvent.click(item);

    await expect(item).toHaveAttribute('aria-pressed', 'true');
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
    const item = canvas.getByRole('button', { name: 'Item' });

    await expect(canvas.queryByRole('checkbox')).toBeNull();
    await expect(item.querySelector('[data-checked]')).toBeNull();

    await userEvent.click(item);

    await expect(item).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.queryByRole('checkbox')).toBeNull();
    await expect(item.querySelector('[data-checked]')).not.toBeNull();
  },
};

export const ButtonOwner: Story = {
  args: {
    hasSubmenu: true,
    ref: fn(),
    onFocus: fn(),
    render: <button type="button" />,
  },
  play: async ({ canvasElement, args }) => {
    const row = within(canvasElement).getByRole('button', { name: 'Item' });

    row.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');

    await expect(args.ref).toHaveBeenCalledWith(row);
    await expect(args.onFocus).toHaveBeenCalledOnce();
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(row).toHaveFocus();
    await expect(row.getBoundingClientRect().height).toBe(32);
  },
};

export const LinkOwner: Story = {
  args: {
    children: 'https://twenty.com/developers',
    render: (renderProps) => (
      <a {...renderProps} href="#list-item-destination">
        {renderProps.children}
      </a>
    ),
    ref: fn(),
    onClick: fn<NonNullable<ListItemProps['onClick']>>((event) =>
      event.preventDefault(),
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', {
      name: 'https://twenty.com/developers',
    });

    await expect(canvas.getAllByRole('link')).toHaveLength(1);
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', '#list-item-destination');
    await expect(args.ref).toHaveBeenCalledWith(link);
    link.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'click', defaultPrevented: true }),
    );
    await expect(link).toHaveFocus();
  },
};

export const PlainUrlLabel: Story = {
  args: { children: 'https://twenty.com/developers' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('https://twenty.com/developers'),
    ).toBeVisible();
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};

export const ExplicitLinkContent: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    children: <a href="#list-item-resource">Read documentation</a>,
    description: 'Resource',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('link')).toHaveLength(1);
    await expect(
      canvas.getByRole('link', { name: 'Read documentation' }),
    ).toHaveAttribute('href', '#list-item-resource');
    await expect(canvas.getByText('Resource')).toBeVisible();
  },
};

export const OverflowingLabel: Story = {
  parameters: { container: { width: 160 } },
  args: { children: 'A workspace preference with a long label' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const label = canvas.getByText('A workspace preference with a long label');

    await userEvent.hover(label);

    await expect(await page.findByRole('tooltip')).toHaveTextContent(
      'A workspace preference with a long label',
    );
  },
};

export const PersistentActions: Story = {
  args: {
    actionsVisibility: 'always',
    actions: (
      <>
        <Button
          aria-label="Edit"
          variant="ghost"
          size="sm"
          startIcon={<IconEdit />}
        />
        <Button
          aria-label="Delete"
          variant="ghost"
          size="sm"
          startIcon={<IconTrash />}
        />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Delete' })).toBeVisible();
  },
};

export const MenuOwner: Story = {
  parameters: { container: { width: 240, height: 200 } },
  render: (args) => <ListItemMenuExample onClick={args.onClick} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Record actions' });

    await userEvent.click(trigger);
    const menu = await page.findByRole('menu', { name: 'Record actions' });
    await waitFor(() => expect(menu).toBeVisible());
    const duplicate = within(menu).getByRole('menuitem', {
      name: 'Duplicate record',
    });
    const unavailable = within(menu).getByRole('menuitem', {
      name: 'Unavailable action',
    });
    const exported = within(menu).getByRole('menuitem', {
      name: 'Export record',
    });

    await expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    duplicate.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(unavailable).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(menu).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    await expect(exported).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};
