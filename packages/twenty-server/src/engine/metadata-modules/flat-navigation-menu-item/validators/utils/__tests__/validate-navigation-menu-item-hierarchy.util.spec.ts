import { NavigationMenuItemType } from 'twenty-shared/types';

import { validateNavigationMenuItemHierarchy } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-hierarchy.util';

const isAllowed = ({
  type,
  parentType,
}: {
  type: NavigationMenuItemType;
  parentType: NavigationMenuItemType;
}) => validateNavigationMenuItemHierarchy({ type, parentType }).length === 0;

describe('validateNavigationMenuItemHierarchy', () => {
  it('should allow any item at the root', () => {
    expect(
      validateNavigationMenuItemHierarchy({
        type: NavigationMenuItemType.TAB,
        parentType: undefined,
      }),
    ).toEqual([]);
  });

  it('should refuse any parent for a tab', () => {
    expect(
      isAllowed({
        type: NavigationMenuItemType.TAB,
        parentType: NavigationMenuItemType.TAB,
      }),
    ).toBe(false);
    expect(
      isAllowed({
        type: NavigationMenuItemType.TAB,
        parentType: NavigationMenuItemType.SECTION,
      }),
    ).toBe(false);
  });

  it('should only allow a section inside a tab', () => {
    expect(
      isAllowed({
        type: NavigationMenuItemType.SECTION,
        parentType: NavigationMenuItemType.TAB,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.SECTION,
        parentType: NavigationMenuItemType.SECTION,
      }),
    ).toBe(false);
    expect(
      isAllowed({
        type: NavigationMenuItemType.SECTION,
        parentType: NavigationMenuItemType.FOLDER,
      }),
    ).toBe(false);
  });

  it('should refuse any item inside a built-in section', () => {
    expect(
      validateNavigationMenuItemHierarchy({
        type: NavigationMenuItemType.LINK,
        parentType: NavigationMenuItemType.SECTION,
        parentBuiltInSectionKey: 'favorites',
      }),
    ).toHaveLength(1);
  });

  it('should refuse a built-in section that holds children', () => {
    expect(
      validateNavigationMenuItemHierarchy({
        type: NavigationMenuItemType.SECTION,
        builtInSectionKey: 'aiChatRecents',
        parentType: NavigationMenuItemType.TAB,
        childTypes: [NavigationMenuItemType.LINK],
      }),
    ).toHaveLength(1);
  });

  it('should allow a folder inside a tab or a section but not a folder', () => {
    expect(
      isAllowed({
        type: NavigationMenuItemType.FOLDER,
        parentType: NavigationMenuItemType.TAB,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.FOLDER,
        parentType: NavigationMenuItemType.SECTION,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.FOLDER,
        parentType: NavigationMenuItemType.FOLDER,
      }),
    ).toBe(false);
  });

  it('should allow other items inside a tab, a section or a folder only', () => {
    expect(
      isAllowed({
        type: NavigationMenuItemType.LINK,
        parentType: NavigationMenuItemType.TAB,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.LINK,
        parentType: NavigationMenuItemType.SECTION,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.LINK,
        parentType: NavigationMenuItemType.FOLDER,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.LINK,
        parentType: NavigationMenuItemType.OBJECT,
      }),
    ).toBe(false);
  });

  it('should accept a new type that fits its parent and children', () => {
    expect(
      validateNavigationMenuItemHierarchy({
        type: NavigationMenuItemType.SECTION,
        parentType: NavigationMenuItemType.TAB,
        childTypes: [
          NavigationMenuItemType.FOLDER,
          NavigationMenuItemType.LINK,
        ],
      }),
    ).toEqual([]);
  });

  it('should refuse a new type its parent cannot hold', () => {
    expect(
      validateNavigationMenuItemHierarchy({
        type: NavigationMenuItemType.TAB,
        parentType: NavigationMenuItemType.TAB,
        childTypes: [],
      }),
    ).toHaveLength(1);
  });

  it('should refuse a new type that cannot hold its children', () => {
    expect(
      validateNavigationMenuItemHierarchy({
        type: NavigationMenuItemType.SECTION,
        parentType: undefined,
        childTypes: [NavigationMenuItemType.SECTION],
      }),
    ).toHaveLength(1);
  });
});
