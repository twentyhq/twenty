import { isNativePageKey } from '../isNativePageKey';

describe('isNativePageKey', () => {
  it('accepts every registered native page key', () => {
    expect(isNativePageKey('workflows')).toBe(true);
    expect(isNativePageKey('agents')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isNativePageKey('dataModel')).toBe(false);
    expect(isNativePageKey(null)).toBe(false);
    expect(isNativePageKey(undefined)).toBe(false);
  });
});
