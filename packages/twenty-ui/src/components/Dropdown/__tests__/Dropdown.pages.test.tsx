import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Dropdown } from '../Dropdown';

const FilterPages = () => {
  const [search, setSearch] = useState('');

  return (
    <Dropdown.Root kind="menu">
      <Dropdown.Trigger>Filters</Dropdown.Trigger>
      <Dropdown.Content aria-label="Filters">
        <Dropdown.Page id="root">
          <Dropdown.ActionItem page="people">People</Dropdown.ActionItem>
          <Dropdown.ActionItem page="people">Recent people</Dropdown.ActionItem>
          <Dropdown.ActionItem>Clear filters</Dropdown.ActionItem>
        </Dropdown.Page>
        <Dropdown.Page id="people" kind="picker">
          <Dropdown.Back>Back to filters</Dropdown.Back>
          <Dropdown.Search
            aria-label="Search people"
            value={search}
            onValueChange={setSearch}
          />
          <Dropdown.OptionItem selected={false}>
            Ada Lovelace
          </Dropdown.OptionItem>
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

describe('Dropdown pages', () => {
  it('changes interaction kind in the same popup and restores the invoking row on back', async () => {
    const user = userEvent.setup();

    render(<FilterPages />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByRole('menu', { name: 'Filters' })).toBeVisible();
    await user.click(screen.getByRole('menuitem', { name: 'People' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await waitFor(() =>
      expect(
        screen.getByRole('searchbox', { name: 'Search people' }),
      ).toHaveFocus(),
    );
    await user.click(screen.getByRole('button', { name: 'Back to filters' }));
    expect(screen.getByRole('menu', { name: 'Filters' })).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'People' })).toHaveFocus(),
    );
  });

  it('resets navigation to the root page after dismissal', async () => {
    const user = userEvent.setup();

    render(<FilterPages />);

    const trigger = screen.getByRole('button', { name: 'Filters' });

    await user.click(trigger);
    await user.click(screen.getByRole('menuitem', { name: 'People' }));
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    expect(screen.getByRole('menuitem', { name: 'People' })).toBeVisible();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('returns focus to the selected entrypoint when several actions open the same page', async () => {
    const user = userEvent.setup();

    render(<FilterPages />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('menuitem', { name: 'Recent people' }));
    await user.click(screen.getByRole('button', { name: 'Back to filters' }));
    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', { name: 'Recent people' }),
      ).toHaveFocus(),
    );
  });
});
