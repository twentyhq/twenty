import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { type CreateOneObjectFactoryInput } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';

const NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  type
  userWorkspaceId
  targetObjectMetadataId
  position
  applicationId
`;

const findWorkspaceLevelObjectItems = (
  navigationMenuItems: NavigationMenuItemDTO[],
  objectMetadataId: string,
) =>
  navigationMenuItems.filter(
    (navigationMenuItem) =>
      navigationMenuItem.type === NavigationMenuItemType.OBJECT &&
      !isDefined(navigationMenuItem.userWorkspaceId) &&
      navigationMenuItem.targetObjectMetadataId === objectMetadataId,
  );

const getWorkspaceLevelObjectItems = async (objectMetadataId: string) => {
  const {
    data: { navigationMenuItems },
  } = await findNavigationMenuItems({
    expectToFail: false,
    input: undefined,
    gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
  });

  return findWorkspaceLevelObjectItems(navigationMenuItems, objectMetadataId);
};

describe('Navigation menu item side effect on object metadata', () => {
  let createdObjectMetadataId: string | undefined = undefined;

  const uniqueSuffix = Date.now().toString().slice(-8);

  const createObjectInput: CreateOneObjectFactoryInput = {
    namePlural: `navItems${uniqueSuffix}`,
    nameSingular: `navItem${uniqueSuffix}`,
    labelPlural: `Nav Items ${uniqueSuffix}`,
    labelSingular: `Nav Item ${uniqueSuffix}`,
    description: 'Object for navigation menu item side effect tests',
    icon: 'IconBox',
    isLabelSyncedWithName: false,
  };

  const deleteCreatedObjectMetadata = async () => {
    if (!isDefined(createdObjectMetadataId)) {
      return;
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
      expectToFail: false,
    });

    createdObjectMetadataId = undefined;
  };

  afterEach(deleteCreatedObjectMetadata);

  it('should provision exactly one workspace-level OBJECT item when a custom object is created', async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: 'id',
    });

    createdObjectMetadataId = createOneObject.id;

    const navigationMenuItems = await getWorkspaceLevelObjectItems(
      createdObjectMetadataId,
    );

    expect(navigationMenuItems).toHaveLength(1);
    expect(navigationMenuItems[0]).toEqual(
      expect.objectContaining({
        type: NavigationMenuItemType.OBJECT,
        targetObjectMetadataId: createdObjectMetadataId,
      }),
    );
  });

  it('should keep the same item when the object is renamed', async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: 'id',
    });

    createdObjectMetadataId = createOneObject.id;

    const [navigationMenuItemBeforeRename] =
      await getWorkspaceLevelObjectItems(createdObjectMetadataId);

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: {
          nameSingular: `renamedNavItem${uniqueSuffix}`,
          namePlural: `renamedNavItems${uniqueSuffix}`,
        },
      },
    });

    const navigationMenuItemsAfterRename = await getWorkspaceLevelObjectItems(
      createdObjectMetadataId,
    );

    expect(navigationMenuItemsAfterRename).toHaveLength(1);
    expect(navigationMenuItemsAfterRename[0].id).toBe(
      navigationMenuItemBeforeRename.id,
    );
  });

  it('should delete the item when the object is deleted', async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: 'id',
    });

    createdObjectMetadataId = createOneObject.id;
    const deletedObjectMetadataId = createdObjectMetadataId;

    expect(
      await getWorkspaceLevelObjectItems(deletedObjectMetadataId),
    ).toHaveLength(1);

    await deleteCreatedObjectMetadata();

    expect(
      await getWorkspaceLevelObjectItems(deletedObjectMetadataId),
    ).toHaveLength(0);
  });
});
