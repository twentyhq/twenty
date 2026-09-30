import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatShortcut } from '@ui/primitives/typography';

afterEach(() => vi.unstubAllGlobals());

describe('formatShortcut', () => {
  it.each([
    { platform: 'mac', expected: '⌘⏎' },
    { platform: 'other', expected: 'Ctrl ⏎' },
  ] as const)('formats combinations on $platform', ({ platform, expected }) => {
    expect(
      formatShortcut({
        shortcut: { type: 'combination', keys: ['Mod', 'Enter'] },
        platform,
      }),
    ).toBe(expected);
  });

  it('keeps combinations inside a localized sequence', () => {
    expect(
      formatShortcut({
        shortcut: {
          type: 'sequence',
          steps: [
            ['Control', 'K'],
            ['Control', 'C'],
          ],
        },
        platform: 'other',
        sequenceJoinLabel: 'followed by',
      }),
    ).toBe('Ctrl K followed by Ctrl C');
  });

  it.each([
    { userAgent: 'Macintosh; Intel Mac OS X', expected: '⌘K' },
    { userAgent: 'iPhone; CPU iPhone OS', expected: '⌘K' },
    { userAgent: 'iPad; CPU OS', expected: '⌘K' },
    { userAgent: 'Windows NT 10.0', expected: 'Ctrl K' },
    { userAgent: 'Linux', expected: 'Ctrl K' },
  ])('detects the platform from $userAgent', ({ userAgent, expected }) => {
    vi.stubGlobal('navigator', { userAgent });
    expect(
      formatShortcut({ shortcut: { type: 'combination', keys: ['Mod', 'K'] } }),
    ).toBe(expected);
  });

  it('formats safely without browser globals', () => {
    vi.stubGlobal('navigator', undefined);
    expect(
      formatShortcut({ shortcut: { type: 'combination', keys: ['Mod', '+'] } }),
    ).toBe('Ctrl +');
  });

  it.each([
    {
      platform: 'mac',
      keys: ['CommandOrControl', 'Shift', 'Space'],
      expected: '⌘ + Shift + Space',
    },
    {
      platform: 'other',
      keys: ['CommandOrControl', 'Shift', 'Space'],
      expected: 'Ctrl + Shift + Space',
    },
    {
      platform: 'mac',
      keys: ['Control', 'Alt', '7'],
      expected: 'Ctrl + ⌥ + 7',
    },
    {
      platform: 'other',
      keys: ['Control', 'Alt', '7'],
      expected: 'Ctrl + Alt + 7',
    },
  ] as const)(
    'preserves accelerator labels on $platform for $keys',
    ({ platform, keys, expected }) => {
      expect(
        formatShortcut({
          shortcut: { type: 'combination', keys },
          platform,
          combinationSeparator: ' + ',
        }),
      ).toBe(expected);
    },
  );

  it('omits empty steps without adding separators', () => {
    expect(
      formatShortcut({
        shortcut: { type: 'sequence', steps: [[], ['G'], [], ['P']] },
      }),
    ).toBe('G then P');
    expect(
      formatShortcut({ shortcut: { type: 'combination', keys: [] } }),
    ).toBe('');
  });
});
