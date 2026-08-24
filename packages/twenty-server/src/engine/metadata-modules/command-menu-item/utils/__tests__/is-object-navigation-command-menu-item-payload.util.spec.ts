import { isObjectNavigationCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-navigation-command-menu-item-payload.util';

describe('isObjectNavigationCommandMenuItemPayload', () => {
  it('accepts a payload targeting an object', () => {
    expect(
      isObjectNavigationCommandMenuItemPayload({
        objectMetadataItemId: 'c1c2c3c4-c5c6-4000-8000-000000000001',
      }),
    ).toBe(true);
  });

  it('rejects a path payload', () => {
    expect(
      isObjectNavigationCommandMenuItemPayload({ path: '/settings/profile' }),
    ).toBe(false);
  });

  it('rejects a path payload carrying an object metadata item id', () => {
    expect(
      isObjectNavigationCommandMenuItemPayload({
        path: '/settings/profile',
        objectMetadataItemId: 'c1c2c3c4-c5c6-4000-8000-000000000001',
      }),
    ).toBe(false);
  });

  it('rejects an empty object metadata item id', () => {
    expect(
      isObjectNavigationCommandMenuItemPayload({ objectMetadataItemId: '' }),
    ).toBe(false);
  });

  it('rejects a nullish payload', () => {
    expect(isObjectNavigationCommandMenuItemPayload(null)).toBe(false);
    expect(isObjectNavigationCommandMenuItemPayload(undefined)).toBe(false);
  });
});
