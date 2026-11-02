import { isReservedSettingsMenuItemSlug } from '@/application/utils/isReservedSettingsMenuItemSlug';

describe('isReservedSettingsMenuItemSlug', () => {
  it.each(['general', 'variables'])(
    'should reserve the built-in "%s" tab id',
    (slug) => {
      expect(isReservedSettingsMenuItemSlug(slug)).toBe(true);
    },
  );

  it('should reserve a UUID-shaped slug, which could shadow a tab link', () => {
    expect(
      isReservedSettingsMenuItemSlug('7d48ab00-8e9c-408b-b7ea-8e752c59ee7a'),
    ).toBe(true);
  });

  it('should allow an unrelated slug', () => {
    expect(isReservedSettingsMenuItemSlug('general-settings')).toBe(false);
  });
});
