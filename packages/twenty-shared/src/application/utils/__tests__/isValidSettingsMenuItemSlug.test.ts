import {
  isValidSettingsMenuItemSlug,
  SETTINGS_MENU_ITEM_SLUG_MAX_LENGTH,
} from '@/application/utils/isValidSettingsMenuItemSlug';

describe('isValidSettingsMenuItemSlug', () => {
  it.each(['sync', 'sync-settings', 'v2', 'a-1-b'])(
    'should accept the kebab-case slug "%s"',
    (slug) => {
      expect(isValidSettingsMenuItemSlug(slug)).toBe(true);
    },
  );

  it.each([
    '',
    'Sync',
    'sync settings',
    'sync_settings',
    '-sync',
    'sync-',
    'sync--settings',
    'sync/settings',
  ])('should reject "%s"', (slug) => {
    expect(isValidSettingsMenuItemSlug(slug)).toBe(false);
  });

  it('should reject a slug longer than the maximum length', () => {
    expect(
      isValidSettingsMenuItemSlug(
        'a'.repeat(SETTINGS_MENU_ITEM_SLUG_MAX_LENGTH),
      ),
    ).toBe(true);
    expect(
      isValidSettingsMenuItemSlug(
        'a'.repeat(SETTINGS_MENU_ITEM_SLUG_MAX_LENGTH + 1),
      ),
    ).toBe(false);
  });
});
