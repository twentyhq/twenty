import { describe, expect, it } from 'vitest';

import { getDateCalendarKeyboardTarget } from '../getDateCalendarKeyboardTarget';

describe('getDateCalendarKeyboardTarget', () => {
  it.each([
    { key: 'ArrowLeft', direction: 'ltr' as const, expected: '2026-10-21' },
    { key: 'ArrowRight', direction: 'ltr' as const, expected: '2026-10-23' },
    { key: 'ArrowLeft', direction: 'rtl' as const, expected: '2026-10-23' },
    { key: 'ArrowRight', direction: 'rtl' as const, expected: '2026-10-21' },
    { key: 'ArrowUp', direction: 'ltr' as const, expected: '2026-10-15' },
    { key: 'ArrowDown', direction: 'ltr' as const, expected: '2026-10-29' },
    { key: 'Home', direction: 'ltr' as const, expected: '2026-10-19' },
    { key: 'End', direction: 'ltr' as const, expected: '2026-10-25' },
    { key: 'PageUp', direction: 'ltr' as const, expected: '2026-09-22' },
    { key: 'PageDown', direction: 'ltr' as const, expected: '2026-11-22' },
  ])('maps $key in $direction to $expected', ({ key, direction, expected }) => {
    expect(
      getDateCalendarKeyboardTarget({
        date: '2026-10-22',
        key,
        direction,
        shiftKey: false,
        weekStart: 1,
      }),
    ).toBe(expected);
  });

  it('uses the configured start of the week for Home and End', () => {
    const keyboardState = {
      date: '2026-10-22',
      direction: 'ltr' as const,
      shiftKey: false,
      weekStart: 0 as const,
    };

    expect(
      getDateCalendarKeyboardTarget({ ...keyboardState, key: 'Home' }),
    ).toBe('2026-10-18');
    expect(
      getDateCalendarKeyboardTarget({ ...keyboardState, key: 'End' }),
    ).toBe('2026-10-24');
  });

  it('clamps leap day when Shift and PageDown request the following year', () => {
    expect(
      getDateCalendarKeyboardTarget({
        date: '2024-02-29',
        key: 'PageDown',
        direction: 'ltr',
        shiftKey: true,
        weekStart: 0,
      }),
    ).toBe('2025-02-28');
  });

  it('does not cross the lower year bound or handle unrelated keys', () => {
    const keyboardState = {
      date: '0001-01-01',
      direction: 'ltr' as const,
      shiftKey: false,
      weekStart: 0 as const,
    };

    expect(
      getDateCalendarKeyboardTarget({ ...keyboardState, key: 'ArrowLeft' }),
    ).toBeNull();
    expect(
      getDateCalendarKeyboardTarget({ ...keyboardState, key: 'Tab' }),
    ).toBeNull();
  });
});
