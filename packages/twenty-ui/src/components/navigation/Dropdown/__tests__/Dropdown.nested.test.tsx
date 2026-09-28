import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dropdown } from '../Dropdown';

const NestedPicker = ({ onSelect }: { onSelect: () => void }) => (
  <>
    <button>Outside</button>
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Sort</Dropdown.Trigger>
      <Dropdown.Content aria-label="Sort fields">
        <Dropdown.Root type="picker">
          <Dropdown.Trigger>Direction</Dropdown.Trigger>
          <Dropdown.Content aria-label="Sort direction">
            <Dropdown.OptionItem selected={false} onSelect={onSelect}>
              Descending
            </Dropdown.OptionItem>
          </Dropdown.Content>
        </Dropdown.Root>
        <Dropdown.Search aria-label="Search fields" />
        <Dropdown.OptionItem selected={false}>Name</Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  </>
);

describe('Independent nested dropdown roots', () => {
  it('selects an inner option without closing its parent and restores the inner trigger focus', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<NestedPicker onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: 'Sort' }));
    await user.click(screen.getByRole('button', { name: 'Direction' }));
    await user.click(screen.getByRole('button', { name: 'Descending' }));

    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Sort direction' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('dialog', { name: 'Sort fields' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Direction' })).toHaveFocus();
  });

  it.each(['escape', 'outside press'] as const)(
    'dismisses one layer at a time with %s',
    async (dismissal) => {
      const user = userEvent.setup();
      render(<NestedPicker onSelect={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: 'Sort' }));
      await user.click(screen.getByRole('button', { name: 'Direction' }));
      await screen.findByRole('dialog', { name: 'Sort direction' });

      const dismiss = async () => {
        if (dismissal === 'escape') {
          await user.keyboard('{Escape}');
          return;
        }
        await user.click(screen.getByRole('button', { name: 'Outside' }));
      };

      await dismiss();
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: 'Sort direction' }),
        ).not.toBeInTheDocument(),
      );
      expect(screen.getByRole('dialog', { name: 'Sort fields' })).toBeVisible();
      if (dismissal === 'escape') {
        expect(screen.getByRole('button', { name: 'Direction' })).toHaveFocus();
      }
      await user.click(screen.getByRole('button', { name: 'Direction' }));
      await screen.findByRole('dialog', { name: 'Sort direction' });
      await dismiss();
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: 'Sort direction' }),
        ).not.toBeInTheDocument(),
      );
      expect(screen.getByRole('dialog', { name: 'Sort fields' })).toBeVisible();
      await dismiss();
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
    },
  );
});
