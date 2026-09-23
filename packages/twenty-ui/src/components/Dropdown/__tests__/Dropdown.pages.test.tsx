import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from '@ui/primitives/input/Input/Input';

import { Dropdown } from '../Dropdown';
import { type DropdownType } from '../types/DropdownType';

type FilterPagesProps = {
  actions?: { label: string; page?: string }[];
  keepMounted?: boolean;
};

const FilterPages = ({
  actions = [
    { label: 'People', page: 'people' },
    { label: 'Recent people', page: 'people' },
    { label: 'Clear filters' },
  ],
  keepMounted,
}: FilterPagesProps) => {
  const [search, setSearch] = useState('');

  return (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Filters</Dropdown.Trigger>
      <Dropdown.Content aria-label="Filters" keepMounted={keepMounted}>
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
  it('keeps the current page and focus when navigation is prevented', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.Page id="root">
            <Dropdown.ActionItem
              page="edit"
              onClick={(event) => event.preventDefault()}
            >
              Edit
            </Dropdown.ActionItem>
          </Dropdown.Page>
          <Dropdown.Page id="edit" type="panel">
            <Input aria-label="Name" />
          </Dropdown.Page>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    const edit = screen.getByRole('menuitem', { name: 'Edit' });

    await user.click(edit);

    expect(edit).toHaveFocus();
    expect(
      screen.queryByRole('textbox', { name: 'Name' }),
    ).not.toBeInTheDocument();
  });

  it('preserves focus when the destination page arrives after navigation', async () => {
    const user = userEvent.setup();
    const DeferredPages = ({ isLoaded }: { isLoaded: boolean }) => (
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.Page id="root">
            <Dropdown.ActionItem page="edit">Edit</Dropdown.ActionItem>
          </Dropdown.Page>
          {isLoaded && (
            <Dropdown.Page id="edit" type="panel">
              <Input aria-label="Name" />
              <Dropdown.Back>Back to actions</Dropdown.Back>
            </Dropdown.Page>
          )}
        </Dropdown.Content>
      </Dropdown.Root>
    );
    const { rerender } = render(<DeferredPages isLoaded={false} />);

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    const content = screen.getByRole('menu', { name: 'Record actions' });

    await waitFor(() => expect(content).toHaveFocus());
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    rerender(<DeferredPages isLoaded />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeVisible();
    expect(content).toHaveFocus();
  });

  it('uses the default page type and preserves the initial keyboard focus edge', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="picker" defaultPage="actions">
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.Page id="actions" type="menu">
            <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
            <Dropdown.ActionItem>Export</Dropdown.ActionItem>
          </Dropdown.Page>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.tab();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menu', { name: 'Record actions' })).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Export' })).toHaveFocus(),
    );
  });

  it('uses native form focus when the default page overrides a menu with a panel', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="menu" defaultPage="edit">
        <Dropdown.Trigger>Edit details</Dropdown.Trigger>
        <Dropdown.Content aria-label="Edit details">
          <Dropdown.Page id="edit" type="panel">
            <Input aria-label="Name" />
            <Dropdown.ActionItem>Save</Dropdown.ActionItem>
          </Dropdown.Page>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.tab();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('dialog', { name: 'Edit details' })).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus(),
    );
  });

  it('preserves editing focus when an active page rerenders or changes type', async () => {
    const user = userEvent.setup();
    const EditPages = ({ pageType }: { pageType: DropdownType }) => {
      const [name, setName] = useState('Acme');
      const [website, setWebsite] = useState('acme.example');

      return (
        <Dropdown.Root type="menu">
          <Dropdown.Trigger>Record actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Record actions">
            <Dropdown.Page id="root">
              <Dropdown.ActionItem page="edit">Edit</Dropdown.ActionItem>
            </Dropdown.Page>
            <Dropdown.Page id="edit" type={pageType}>
              <Input aria-label="Name" value={name} onValueChange={setName} />
              <Input
                aria-label="Website"
                value={website}
                onValueChange={setWebsite}
              />
              <Dropdown.Back>Back to actions</Dropdown.Back>
            </Dropdown.Page>
          </Dropdown.Content>
        </Dropdown.Root>
      );
    };
    const { rerender } = render(<EditPages pageType="panel" />);

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    const name = screen.getByRole('textbox', { name: 'Name' });
    const website = screen.getByRole('textbox', { name: 'Website' });

    await waitFor(() => expect(name).toHaveFocus());
    await user.keyboard(' company');
    expect(name).toHaveValue('Acme company');
    await user.tab();
    expect(website).toHaveFocus();
    await user.keyboard('{End}/contact');
    expect(website).toHaveValue('acme.example/contact');
    expect(website).toHaveFocus();

    rerender(<EditPages pageType="menu" />);

    expect(screen.getByRole('menu', { name: 'Record actions' })).toBeVisible();
    expect(website).toHaveFocus();
    await user.click(screen.getByRole('menuitem', { name: 'Back to actions' }));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus(),
    );
  });

  it('respects disabled initial focus when the default page mounts', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Filters</Dropdown.Trigger>
        <Dropdown.Content aria-label="Filters" initialFocus={false}>
          <Dropdown.Page id="root" type="picker">
            <Dropdown.Search aria-label="Search people" />
          </Dropdown.Page>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Filters' });

    await user.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    expect(trigger).toHaveFocus();
  });

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

  it.each([false, true])(
    'resets navigation to the root page after dismissal with keepMounted=%s',
    async (keepMounted) => {
      const user = userEvent.setup();

      render(<FilterPages keepMounted={keepMounted} />);

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
    },
  );

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
