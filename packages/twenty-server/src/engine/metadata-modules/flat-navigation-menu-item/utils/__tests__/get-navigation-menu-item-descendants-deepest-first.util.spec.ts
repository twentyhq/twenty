import { getNavigationMenuItemDescendantsDeepestFirst } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/get-navigation-menu-item-descendants-deepest-first.util';

describe('getNavigationMenuItemDescendantsDeepestFirst', () => {
  const childrenByUserWorkspaceIdAndParentId = {
    null: {
      tab: [{ id: 'section' }],
      section: [{ id: 'folder' }, { id: 'link' }],
      folder: [{ id: 'view' }],
    },
  };

  it('should return every descendant with children before their parent', () => {
    expect(
      getNavigationMenuItemDescendantsDeepestFirst({
        parentId: 'tab',
        userWorkspaceIdKey: 'null',
        childrenByUserWorkspaceIdAndParentId,
      }).map(({ id }) => id),
    ).toEqual(['view', 'folder', 'link', 'section']);
  });

  it('should return nothing for an item without children', () => {
    expect(
      getNavigationMenuItemDescendantsDeepestFirst({
        parentId: 'link',
        userWorkspaceIdKey: 'null',
        childrenByUserWorkspaceIdAndParentId,
      }),
    ).toEqual([]);
  });
});
