import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { IconSearch, IconTrash } from '@ui/icon';
import { MenuItem } from '../MenuItem';
import { MenuItemDraggable } from '@ui/primitives/navigation/MenuItemDraggable/MenuItemDraggable';

describe.each([MenuItem, MenuItemDraggable])('menu actions', (Component) => {
  it('keeps explicit and unavailable actions disabled inside wrappers', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Component
        text="Record"
        iconButtons={[
          {
            Icon: IconTrash,
            ariaLabel: 'Delete',
            disabled: true,
            onClick,
            Wrapper: ({ iconButton }) => <span>{iconButton}</span>,
          },
          { Icon: IconSearch, ariaLabel: 'Search' },
        ]}
      />,
    );

    const disabled = screen.getByRole('button', { name: 'Delete' });
    expect(disabled).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
    await user.click(disabled);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('preserves action propagation control and avoids form submission', async () => {
    const user = userEvent.setup();
    const onParentClick = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onClick = vi.fn((event) => event.stopPropagation());
    render(
      <form onSubmit={onSubmit}>
        <Component
          text="Record"
          onClick={onParentClick}
          iconButtons={[{ Icon: IconSearch, ariaLabel: 'Search', onClick }]}
        />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onParentClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
