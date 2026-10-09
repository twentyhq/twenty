import { isSafeInternalPath } from '@/utils/url/isSafeInternalPath';

describe('isSafeInternalPath', () => {
  it('accepts a path or a hash of the app', () => {
    expect(isSafeInternalPath('/workflows')).toBe(true);
    expect(isSafeInternalPath('/objects/companies?viewId=1')).toBe(true);
    expect(isSafeInternalPath('#section')).toBe(true);
  });

  it('rejects anything a browser could resolve to another origin', () => {
    expect(isSafeInternalPath('https://twenty.com')).toBe(false);
    expect(isSafeInternalPath('//evil.com/workflows')).toBe(false);
    expect(isSafeInternalPath('/\\evil.com')).toBe(false);
    expect(isSafeInternalPath('/\t/evil.com')).toBe(false);
    expect(isSafeInternalPath('workflows')).toBe(false);
    expect(isSafeInternalPath('')).toBe(false);
  });
});
