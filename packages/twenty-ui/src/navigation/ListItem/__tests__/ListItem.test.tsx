import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ListItem } from '../ListItem';
import styles from '../ListItem.module.scss';

runComponentConformance({
  name: 'ListItem',
  element: <ListItem>Item</ListItem>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
});

describe('ListItem', () => {
  it('renders its children, icons and inline description', () => {
    render(
      <ListItem
        startIcon={<span>start</span>}
        endIcon={<span>end</span>}
        description="Description"
      >
        Item
      </ListItem>,
    );

    expect(screen.getByText('Item')).toBeInTheDocument();
    expect(screen.getByText('start')).toBeInTheDocument();
    expect(screen.getByText('end')).toBeInTheDocument();
    expect(screen.getByText('Description')).toHaveClass(
      styles.inlineDescription,
    );
  });

  it('places the description at the end on demand', () => {
    render(
      <ListItem description="Description" descriptionPlacement="end">
        Item
      </ListItem>,
    );

    expect(screen.getByText('Description')).toHaveClass(styles.endDescription);
  });

  it('renders every hotkey', () => {
    render(<ListItem hotkeys={['⌘', 'K']}>Item</ListItem>);

    expect(screen.getByText('⌘')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('renders a chevron only when it opens a submenu', () => {
    const { container, rerender } = render(<ListItem>Item</ListItem>);

    expect(container.querySelector('svg')).toBeNull();

    rerender(<ListItem hasSubmenu>Item</ListItem>);

    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  it('calls onClick and lets the click bubble without preventing its default', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onAncestorClick = vi.fn();

    const { container } = render(<ListItem onClick={onClick}>Item</ListItem>);

    container.addEventListener('click', onAncestorClick);

    await user.click(screen.getByText('Item'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0].defaultPrevented).toBe(false);
    expect(onAncestorClick).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks and exposes its state when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <ListItem disabled onClick={onClick} data-testid="item">
        Item
      </ListItem>,
    );

    const item = screen.getByTestId('item');

    await user.click(item);

    expect(onClick).not.toHaveBeenCalled();
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(item).toHaveAttribute('data-disabled');
  });

  it('cancels the native action of a disabled polymorphic root', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onAncestorClick = vi.fn();

    const { container } = render(
      <ListItem
        disabled
        onClick={onClick}
        render={<a href="#target" aria-label="Item link" />}
      >
        Item
      </ListItem>,
    );

    container.addEventListener('click', onAncestorClick);

    await user.click(screen.getByText('Item'));

    expect(screen.getByText('Item').closest('a')).toHaveAttribute(
      'href',
      '#target',
    );
    expect(onClick).not.toHaveBeenCalled();
    expect(onAncestorClick.mock.calls[0][0].defaultPrevented).toBe(true);
  });

  it('exposes its state as data attributes', () => {
    const { rerender } = render(<ListItem data-testid="item">Item</ListItem>);

    const item = screen.getByTestId('item');

    expect(item).not.toHaveAttribute('data-selected');
    expect(item).not.toHaveAttribute('data-highlighted');
    expect(item).not.toHaveAttribute('data-disabled');
    expect(item).toHaveAttribute('data-color', 'neutral');
    expect(item).toHaveAttribute('data-indicator', 'none');

    rerender(
      <ListItem
        data-testid="item"
        selected
        focused
        color="danger"
        indicator="check"
      >
        Item
      </ListItem>,
    );

    expect(item).toHaveAttribute('data-selected');
    expect(item).toHaveAttribute('data-highlighted');
    expect(item).toHaveAttribute('data-color', 'danger');
    expect(item).toHaveAttribute('data-indicator', 'check');
  });

  it('passes its state to a render function', () => {
    render(
      <ListItem
        focused
        render={(props, state) => (
          <div
            {...props}
            data-testid="item"
            data-render-highlighted={state.highlighted}
          />
        )}
      >
        Item
      </ListItem>,
    );

    expect(screen.getByTestId('item')).toHaveAttribute(
      'data-render-highlighted',
      'true',
    );
  });

  it('shows the check indicator only when selected', () => {
    const { container, rerender } = render(
      <ListItem indicator="check">Item</ListItem>,
    );

    expect(container.querySelector('svg')).toBeNull();

    rerender(
      <ListItem indicator="check" selected>
        Item
      </ListItem>,
    );

    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  it('renders a decorative checkbox that follows the selected state', () => {
    const { container, rerender } = render(
      <ListItem indicator="checkbox">Item</ListItem>,
    );

    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(container.querySelector('[data-checked]')).toBeNull();

    rerender(
      <ListItem indicator="checkbox" selected>
        Item
      </ListItem>,
    );

    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(container.querySelector('[data-checked]')).not.toBeNull();
  });

  it('lets an action click reach both the action and the item', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onActionClick = vi.fn();

    render(
      <ListItem
        onClick={onClick}
        actions={
          <button type="button" onClick={onActionClick}>
            Delete
          </button>
        }
      >
        Item
      </ListItem>,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
