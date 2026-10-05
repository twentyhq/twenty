import { isSyncCursorNewer } from 'src/modules/messaging/message-import-manager/utils/is-sync-cursor-newer.util';

describe('isSyncCursorNewer', () => {
  it('should accept any cursor when there is no current cursor', () => {
    expect(isSyncCursorNewer('12', null)).toBe(true);
    expect(isSyncCursorNewer('12', undefined)).toBe(true);
    expect(isSyncCursorNewer('12', '')).toBe(true);
  });

  it('should compare numeric cursors by value', () => {
    expect(isSyncCursorNewer('1000012', '999999')).toBe(true);
    expect(isSyncCursorNewer('999999', '1000012')).toBe(false);
    expect(isSyncCursorNewer('1000012', '1000012')).toBe(false);
    expect(
      isSyncCursorNewer('18446744073709551616', '18446744073709551615'),
    ).toBe(true);
  });

  it('should fall back to string comparison for non numeric cursors', () => {
    expect(isSyncCursorNewer('b', 'a')).toBe(true);
    expect(isSyncCursorNewer('a', 'b')).toBe(false);
  });
});
