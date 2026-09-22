import { ListItem } from '../ListItem';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@ui/primitives/input/Button/Button';
import { IconSearch, IconTrash } from '@ui/icon';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';

describe('ListItem actions', () => {
  it('preserves disabled buttons and wrapper-controlled triggers', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onSearch = vi.fn();
    render(
      <ListItem
        children="Record"
        actions={
          <ButtonGroup attached={false} onClick={onSearch}>
            <Button aria-label="Delete" disabled onClick={onDelete}>
              <IconTrash />
            </Button>
            <Button aria-label="Search">
              <IconSearch />
            </Button>
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
        <ListItem
          children="Record"
          onClick={onParentClick}
          actions={
            <Button aria-label="Search" onClick={onClick}>
              <IconSearch />
            </Button>
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
