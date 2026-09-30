import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MenuItem } from '@ui/components/navigation/MenuItem/MenuItem';
import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';

describe('MenuItem shortcut accessibility', () => {
  it('forwards key labels from list and legacy menu rows', () => {
    const shortcut = { type: 'combination', keys: ['⌫'] } as const;
    const shortcutAccessibleKeyLabels = { Backspace: '[Backspace]' };
    render(
      <>
        <ListItem
          shortcut={shortcut}
          shortcutAccessibleKeyLabels={shortcutAccessibleKeyLabels}
        >
          Delete record
        </ListItem>
        <MenuItem
          text="Delete record"
          shortcut={shortcut}
          shortcutAccessibleKeyLabels={shortcutAccessibleKeyLabels}
        />
      </>,
    );

    expect(screen.getAllByRole('img', { name: '[Backspace]' })).toHaveLength(2);
  });
});
