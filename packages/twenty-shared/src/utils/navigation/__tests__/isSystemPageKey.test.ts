import { isSystemPageKey } from '../isSystemPageKey';

describe('isSystemPageKey', () => {
  it('accepts every registered system page key', () => {
    expect(isSystemPageKey('workflows')).toBe(true);
    expect(isSystemPageKey('agents')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isSystemPageKey('dataModel')).toBe(false);
    expect(isSystemPageKey(null)).toBe(false);
    expect(isSystemPageKey(undefined)).toBe(false);
  });
});
