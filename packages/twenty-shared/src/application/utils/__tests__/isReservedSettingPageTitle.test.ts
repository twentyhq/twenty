import { isReservedSettingPageTitle } from '@/application/utils/isReservedSettingPageTitle';

describe('isReservedSettingPageTitle', () => {
  it('should reserve the built-in General title', () => {
    expect(isReservedSettingPageTitle('General')).toBe(true);
  });

  it('should ignore casing and surrounding whitespace', () => {
    expect(isReservedSettingPageTitle('  gEnErAl ')).toBe(true);
  });

  it('should allow a title that merely contains the reserved word', () => {
    expect(isReservedSettingPageTitle('General settings')).toBe(false);
  });

  it('should allow an unrelated title', () => {
    expect(isReservedSettingPageTitle('Variables')).toBe(false);
  });
});
