import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Dropdown } from '../Dropdown';

describe('Dropdown submenu hover', () => {
  it.each([
    { direction: 'ltr', forwardKey: '{ArrowRight}', dismissKey: '{ArrowLeft}' },
    { direction: 'rtl', forwardKey: '{ArrowLeft}', dismissKey: '{ArrowRight}' },
    { direction: 'ltr', forwardKey: '{ArrowRight}', dismissKey: '{Escape}' },
  ] as const)(
    'enters a hovered submenu and restores focus with $dismissKey in $direction layout',
    async ({ direction, forwardKey, dismissKey }) => {
      const user = userEvent.setup();

      render(
        <Dropdown.Root kind="menu">
          <Dropdown.Trigger>Record actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Record actions" style={{ direction }}>
            <Dropdown.Submenu>
              <Dropdown.SubmenuTrigger delay={0} style={{ direction }}>
                Export
              </Dropdown.SubmenuTrigger>
              <Dropdown.Content
                aria-label="Export formats"
                style={{ direction }}
              >
                <Dropdown.ActionItem>CSV</Dropdown.ActionItem>
                <Dropdown.ActionItem>Excel</Dropdown.ActionItem>
              </Dropdown.Content>
            </Dropdown.Submenu>
          </Dropdown.Content>
        </Dropdown.Root>,
      );

      await user.tab();
      await user.keyboard('{ArrowDown}');
      const trigger = await screen.findByRole('menuitem', { name: 'Export' });

      await waitFor(() => expect(trigger).toHaveFocus());
      await user.hover(trigger);
      await screen.findByRole('menu', { name: 'Export formats' });
      expect(trigger).toHaveFocus();
      await user.keyboard(forwardKey);
      await waitFor(() =>
        expect(screen.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
      );
      await user.keyboard(dismissKey);
      await waitFor(() =>
        expect(
          screen.queryByRole('menu', { name: 'Export formats' }),
        ).not.toBeInTheDocument(),
      );
      expect(trigger).toHaveFocus();
    },
  );
});
