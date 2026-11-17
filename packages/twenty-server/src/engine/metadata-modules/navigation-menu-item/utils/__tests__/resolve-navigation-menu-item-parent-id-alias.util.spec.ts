import { NavigationMenuItemException } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { resolveNavigationMenuItemParentIdAlias } from 'src/engine/metadata-modules/navigation-menu-item/utils/resolve-navigation-menu-item-parent-id-alias.util';

describe('resolveNavigationMenuItemParentIdAlias', () => {
  it('should keep parentId when folderId is not passed', () => {
    expect(
      resolveNavigationMenuItemParentIdAlias({ parentId: 'parent', name: 'A' }),
    ).toEqual({ parentId: 'parent', name: 'A' });
  });

  it('should map the deprecated folderId to parentId', () => {
    expect(
      resolveNavigationMenuItemParentIdAlias({ folderId: 'parent', name: 'A' }),
    ).toEqual({ parentId: 'parent', name: 'A' });
  });

  it('should map a null folderId to a null parentId', () => {
    expect(resolveNavigationMenuItemParentIdAlias({ folderId: null })).toEqual({
      parentId: null,
    });
  });

  it('should accept both when they match', () => {
    expect(
      resolveNavigationMenuItemParentIdAlias({
        parentId: 'parent',
        folderId: 'parent',
      }),
    ).toEqual({ parentId: 'parent' });
  });

  it('should throw when parentId and folderId differ', () => {
    expect(() =>
      resolveNavigationMenuItemParentIdAlias({
        parentId: 'parent',
        folderId: 'other',
      }),
    ).toThrow(NavigationMenuItemException);
  });
});
