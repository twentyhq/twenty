import { normalizeNavigationMenuItemManifest } from '@/application/utils/normalizeNavigationMenuItemManifest';
import { NavigationMenuItemType } from '@/types/NavigationMenuItemType';

const BASE_MANIFEST = {
  universalIdentifier: 'item',
  type: NavigationMenuItemType.LINK,
  position: 0,
};

describe('normalizeNavigationMenuItemManifest', () => {
  it('should keep parentUniversalIdentifier', () => {
    expect(
      normalizeNavigationMenuItemManifest({
        ...BASE_MANIFEST,
        parentUniversalIdentifier: 'parent',
      }),
    ).toEqual({ ...BASE_MANIFEST, parentUniversalIdentifier: 'parent' });
  });

  it('should move the deprecated folderUniversalIdentifier to parentUniversalIdentifier', () => {
    expect(
      normalizeNavigationMenuItemManifest({
        ...BASE_MANIFEST,
        folderUniversalIdentifier: 'folder',
      }),
    ).toEqual({ ...BASE_MANIFEST, parentUniversalIdentifier: 'folder' });
  });

  it('should prefer parentUniversalIdentifier when both are set', () => {
    expect(
      normalizeNavigationMenuItemManifest({
        ...BASE_MANIFEST,
        parentUniversalIdentifier: 'parent',
        folderUniversalIdentifier: 'folder',
      }),
    ).toEqual({ ...BASE_MANIFEST, parentUniversalIdentifier: 'parent' });
  });

  it('should leave an item without a parent unchanged', () => {
    expect(normalizeNavigationMenuItemManifest(BASE_MANIFEST)).toEqual(
      BASE_MANIFEST,
    );
  });
});
