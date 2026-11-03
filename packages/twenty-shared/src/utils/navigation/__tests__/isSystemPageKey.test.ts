import { isSystemPageKey } from '../isSystemPageKey';

describe('isSystemPageKey', () => {
  it('accepts every registered system page key', () => {
    expect(isSystemPageKey('workflows')).toBe(true);
    expect(isSystemPageKey('agents')).toBe(true);
    expect(isSystemPageKey('dataModel')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isSystemPageKey('settings')).toBe(false);
    expect(isSystemPageKey(null)).toBe(false);
    expect(isSystemPageKey(undefined)).toBe(false);
  });
});
