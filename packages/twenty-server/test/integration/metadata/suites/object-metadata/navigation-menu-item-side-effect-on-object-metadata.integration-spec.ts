import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { type CreateOneObjectFactoryInput } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';

const findNavigationMenuItemForObject = (
  navigationMenuItems: NavigationMenuItemDTO[],
  objectMetadataId: string,
) =>
  navigationMenuItems.find(
    (item) =>
      item.type === NavigationMenuItemType.OBJECT &&
      item.targetObjectMetadataId === objectMetadataId,
  );

const NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  type
  targetObjectMetadataId
  viewId
  folderId
  position
`;

const buildCreateObjectInput = (
  suffix: string,
): CreateOneObjectFactoryInput => ({
  namePlural: `navSideEffectItems${suffix}`,
  nameSingular: `navSideEffectItem${suffix}`,
  labelPlural: `Nav Side Effect Items ${suffix}`,
  labelSingular: `Nav Side Effect Item ${suffix}`,
  description: 'Object for navigation menu item side effect tests',
  icon: 'IconBox',
  isLabelSyncedWithName: false,
});

const deactivateAndDeleteObject = async (objectMetadataId: string) => {
  await updateOneObjectMetadata({
    expectToFail: false,
    input: {
      idToUpdate: objectMetadataId,
      updatePayload: { isActive: false },
    },
  });

  await deleteOneObjectMetadata({
    input: { idToDelete: objectMetadataId },
    expectToFail: false,
  });
};

describe('Navigation menu item side effect on object metadata', () => {
  let createdObjectMetadataId: string | undefined = undefined;
  let liveObjectMetadataId: string | undefined = undefined;

  const uniqueSuffix = Date.now().toString().slice(-8);

  const createObjectInput = buildCreateObjectInput(uniqueSuffix);

  afterEach(async () => {
    for (const objectMetadataId of [
      createdObjectMetadataId,
      liveObjectMetadataId,
    ]) {
      if (!isDefined(objectMetadataId)) {
        continue;
      }

      await deactivateAndDeleteObject(objectMetadataId);
    }

    createdObjectMetadataId = undefined;
    liveObjectMetadataId = undefined;
  });

  it('should create a navigation menu item when a custom object is created', async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: 'id',
    });

    createdObjectMetadataId = createOneObject.id;

    const {
      data: { navigationMenuItems },
    } = await findNavigationMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
    });

    expect(
      findNavigationMenuItemForObject(
        navigationMenuItems,
        createdObjectMetadataId,
      ),
    ).toEqual(
      expect.objectContaining({
        type: NavigationMenuItemType.OBJECT,
        targetObjectMetadataId: createdObjectMetadataId,
      }),
    );
  });

  it('should delete the navigation menu item when a custom object is deleted, and keep the item of a live object', async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: 'id',
    });

    createdObjectMetadataId = createOneObject.id;
    const deletedObjectId = createdObjectMetadataId;

    const {
      data: { createOneObject: createOneLiveObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: buildCreateObjectInput(`${uniqueSuffix}Live`),
      gqlFields: 'id',
    });

    liveObjectMetadataId = createOneLiveObject.id;
    const keptObjectId = liveObjectMetadataId;

    const {
      data: { navigationMenuItems: itemsBeforeDelete },
    } = await findNavigationMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
    });

    expect(
      findNavigationMenuItemForObject(itemsBeforeDelete, deletedObjectId),
    ).toBeDefined();
    expect(
      findNavigationMenuItemForObject(itemsBeforeDelete, keptObjectId),
    ).toBeDefined();

    await deactivateAndDeleteObject(deletedObjectId);

    createdObjectMetadataId = undefined;

    const {
      data: { navigationMenuItems: itemsAfterDelete },
    } = await findNavigationMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
    });

    expect(
      findNavigationMenuItemForObject(itemsAfterDelete, deletedObjectId),
    ).toBeUndefined();
    expect(
      findNavigationMenuItemForObject(itemsAfterDelete, keptObjectId),
    ).toBeDefined();
  });
});
