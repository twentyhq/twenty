import { isInternalAppPath } from '@/utils/url/isInternalAppPath';

describe('isInternalAppPath', () => {
  it('accepts a path of the app', () => {
    expect(isInternalAppPath('/workflows')).toBe(true);
    expect(isInternalAppPath('/objects/companies?viewId=1')).toBe(true);
  });

  it('rejects absolute and protocol-relative urls', () => {
    expect(isInternalAppPath('https://twenty.com')).toBe(false);
    expect(isInternalAppPath('//evil.com/workflows')).toBe(false);
    expect(isInternalAppPath('/\\evil.com')).toBe(false);
    expect(isInternalAppPath('workflows')).toBe(false);
    expect(isInternalAppPath('')).toBe(false);
  });
});
