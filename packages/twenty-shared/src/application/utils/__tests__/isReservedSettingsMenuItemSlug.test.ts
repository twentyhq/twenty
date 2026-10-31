import { isReservedSettingsMenuItemSlug } from '@/application/utils/isReservedSettingsMenuItemSlug';

describe('isReservedSettingsMenuItemSlug', () => {
  it.each(['general', 'variables'])(
    'should reserve the built-in "%s" tab id',
    (slug) => {
      expect(isReservedSettingsMenuItemSlug(slug)).toBe(true);
    },
  );

  it('should allow an unrelated slug', () => {
    expect(isReservedSettingsMenuItemSlug('general-settings')).toBe(false);
  });
});
