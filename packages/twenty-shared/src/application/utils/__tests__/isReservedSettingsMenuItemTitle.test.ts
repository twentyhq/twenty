import { isReservedSettingsMenuItemTitle } from '@/application/utils/isReservedSettingsMenuItemTitle';

describe('isReservedSettingsMenuItemTitle', () => {
  it('should reserve the built-in General title', () => {
    expect(isReservedSettingsMenuItemTitle('General')).toBe(true);
  });

  it('should ignore casing and surrounding whitespace', () => {
    expect(isReservedSettingsMenuItemTitle('  gEnErAl ')).toBe(true);
  });

  it('should allow a title that merely contains the reserved word', () => {
    expect(isReservedSettingsMenuItemTitle('General settings')).toBe(false);
  });

  it('should allow an unrelated title', () => {
    expect(isReservedSettingsMenuItemTitle('Variables')).toBe(false);
  });
});
