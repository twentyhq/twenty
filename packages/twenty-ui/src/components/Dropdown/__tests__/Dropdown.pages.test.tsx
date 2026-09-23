import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Dropdown } from '../Dropdown';

type FilterPagesProps = {
  actions?: { label: string; page?: string }[];
};

const FilterPages = ({
  actions = [
    { label: 'People', page: 'people' },
    { label: 'Recent people', page: 'people' },
    { label: 'Clear filters' },
  ],
}: FilterPagesProps) => {
  const [search, setSearch] = useState('');

  return (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Filters</Dropdown.Trigger>
      <Dropdown.Content aria-label="Filters">
        <Dropdown.Page id="root">
          {actions.map(({ label, page }) => (
            <Dropdown.ActionItem key={label} page={page}>
              {label}
            </Dropdown.ActionItem>
          ))}
        </Dropdown.Page>
        <Dropdown.Page id="people" type="picker">
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
  it('changes interaction type in the same popup and restores the invoking row on back', async () => {
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

  it('restores the invoking action after its page remounts with reordered entrypoints', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FilterPages />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('menuitem', { name: 'Recent people' }));
    rerender(
      <FilterPages
        actions={[
          { label: 'Recent people', page: 'people' },
          { label: 'People', page: 'people' },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Back to filters' }));
    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', { name: 'Recent people' }),
      ).toHaveFocus(),
    );
  });

  it('restores the unique destination when its action moves and changes label', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FilterPages
        actions={[
          { label: 'People', page: 'people' },
          { label: 'Clear filters' },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('menuitem', { name: 'People' }));
    rerender(
      <FilterPages
        actions={[
          { label: 'Clear filters' },
          { label: 'All people', page: 'people' },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Back to filters' }));
    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', { name: 'All people' }),
      ).toHaveFocus(),
    );
  });
});
