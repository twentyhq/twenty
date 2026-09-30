import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Shortcut } from '@ui/primitives/typography/Shortcut/Shortcut';
import { formatShortcut } from '@ui/primitives/typography/Shortcut/formatShortcut';

describe('Shortcut accessible key labels', () => {
  it.each([
    { platform: 'mac', modifierLabel: '[Command]' },
    { platform: 'other', modifierLabel: '[Control]' },
  ] as const)(
    'localizes resolved modifier names on $platform without changing symbols',
    ({ platform, modifierLabel }) => {
      const shortcut = { type: 'combination', keys: ['Mod', '↑'] } as const;
      render(
        <Shortcut
          shortcut={shortcut}
          platform={platform}
          accessibleKeyLabels={{
            Command: '[Command]',
            Control: '[Control]',
            'Arrow up': '[Arrow up]',
          }}
        />,
      );

      expect(
        screen.getByRole('img', { name: `${modifierLabel} + [Arrow up]` }),
      ).toHaveTextContent(formatShortcut({ shortcut, platform }));
    },
  );

  it('keeps sequence joins and fallback names with partial key labels', () => {
    render(
      <Shortcut
        shortcut={{ type: 'sequence', steps: [['⌫'], ['Enter', 'K']] }}
        accessibleKeyLabels={{ Backspace: '[Backspace]' }}
        sequenceJoinLabel="[then]"
      />,
    );

    expect(
      screen.getByRole('img', { name: '[Backspace] [then] Enter + K' }),
    ).toHaveTextContent('⌫ [then] ⏎');
  });

  it('preserves a full accessible label override', () => {
    render(
      <Shortcut
        shortcut={{ type: 'combination', keys: ['↑'] }}
        accessibleKeyLabels={{ 'Arrow up': '[Arrow up]' }}
        aria-label="Previous item"
      />,
    );

    expect(
      screen.getByRole('img', { name: 'Previous item' }),
    ).toHaveTextContent('↑');
  });
});
