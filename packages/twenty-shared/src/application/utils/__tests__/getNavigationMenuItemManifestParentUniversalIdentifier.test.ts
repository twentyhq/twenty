import { getNavigationMenuItemManifestParentUniversalIdentifier } from '@/application/utils/getNavigationMenuItemManifestParentUniversalIdentifier';

describe('getNavigationMenuItemManifestParentUniversalIdentifier', () => {
  it('should return parentUniversalIdentifier', () => {
    expect(
      getNavigationMenuItemManifestParentUniversalIdentifier({
        parentUniversalIdentifier: 'parent',
      }),
    ).toBe('parent');
  });

  it('should fall back to the deprecated folderUniversalIdentifier', () => {
    expect(
      getNavigationMenuItemManifestParentUniversalIdentifier({
        folderUniversalIdentifier: 'folder',
      }),
    ).toBe('folder');
  });

  it('should prefer parentUniversalIdentifier when both are set', () => {
    expect(
      getNavigationMenuItemManifestParentUniversalIdentifier({
        parentUniversalIdentifier: 'parent',
        folderUniversalIdentifier: 'folder',
      }),
    ).toBe('parent');
  });

  it('should return undefined when neither is set', () => {
    expect(getNavigationMenuItemManifestParentUniversalIdentifier({})).toBe(
      undefined,
    );
  });
});
