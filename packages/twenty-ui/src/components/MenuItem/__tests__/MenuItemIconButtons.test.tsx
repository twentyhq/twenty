import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LightIconButton } from '@ui/components/LightIconButton/LightIconButton';
import { MenuItem } from '@ui/components/MenuItem/MenuItem';
import { MenuItemAvatar } from '@ui/components/MenuItemAvatar/MenuItemAvatar';
import { MenuItemDraggable } from '@ui/components/MenuItemDraggable/MenuItemDraggable';
import { IconSearch, IconTrash } from '@ui/icon';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';

describe.each([
  { name: 'MenuItem', Component: MenuItem },
  { name: 'MenuItemDraggable', Component: MenuItemDraggable },
  { name: 'MenuItemAvatar', Component: MenuItemAvatar },
])('$name icon buttons', ({ Component }) => {
  it('preserves disabled buttons and wrapper-controlled triggers', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onSearch = vi.fn();
    render(
      <Component
        text="Record"
        iconButtons={
          <ButtonGroup attached={false} onClick={onSearch}>
            <LightIconButton aria-label="Delete" disabled onClick={onDelete}>
              <IconTrash />
            </LightIconButton>
            <LightIconButton aria-label="Search">
              <IconSearch />
            </LightIconButton>
          </ButtonGroup>
        }
      />,
    );

    const disabled = screen.getByRole('button', { name: 'Delete' });
    expect(disabled).toBeDisabled();
    await user.click(disabled);
    expect(onDelete).not.toHaveBeenCalled();

    const search = screen.getByRole('button', { name: 'Search' });
    expect(search).toBeEnabled();
    await user.click(search);
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it('preserves click propagation control and avoids form submission', async () => {
    const user = userEvent.setup();
    const onParentClick = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onClick = vi.fn((event) => event.stopPropagation());
    render(
      <form onSubmit={onSubmit}>
        <Component
          text="Record"
          onClick={onParentClick}
          iconButtons={
            <LightIconButton aria-label="Search" onClick={onClick}>
              <IconSearch />
            </LightIconButton>
          }
        />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onParentClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
