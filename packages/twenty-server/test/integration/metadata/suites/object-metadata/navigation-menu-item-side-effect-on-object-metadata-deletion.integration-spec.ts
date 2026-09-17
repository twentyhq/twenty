import { faker } from '@faker-js/faker';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { type CreateOneObjectFactoryInput } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';

const NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  type
  targetObjectMetadataId
  targetRecordId
  viewId
  folderId
  position
`;

const buildCreateObjectInput = (
  suffix: string,
): CreateOneObjectFactoryInput => ({
  namePlural: `navOrphans${suffix}`,
  nameSingular: `navOrphan${suffix}`,
  labelPlural: `Nav Orphans ${suffix}`,
  labelSingular: `Nav Orphan ${suffix}`,
  description: 'Object for navigation menu item deletion side effect tests',
  icon: 'IconBox',
  isLabelSyncedWithName: false,
});

const findItemsReferencingObject = ({
  navigationMenuItems,
  objectMetadataId,
  viewIds,
}: {
  navigationMenuItems: NavigationMenuItemDTO[];
  objectMetadataId: string;
  viewIds: string[];
}) =>
  navigationMenuItems.filter(
    (item) =>
      item.targetObjectMetadataId === objectMetadataId ||
      (isDefined(item.viewId) && viewIds.includes(item.viewId)),
  );

const findNavigationMenuItemRowsReferencingObject = async ({
  objectMetadataId,
  viewIds,
}: {
  objectMetadataId: string;
  viewIds: string[];
}): Promise<{ id: string; type: string }[]> =>
  global.testDataSource.query(
    `SELECT id, type
     FROM core."navigationMenuItem"
     WHERE "targetObjectMetadataId" = $1 OR "viewId" = ANY($2::uuid[])`,
    [objectMetadataId, viewIds],
  );

const listNavigationMenuItems = async () => {
  const {
    data: { navigationMenuItems },
    errors,
  } = await findNavigationMenuItems({
    expectToFail: false,
    input: undefined,
    gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
  });

  expect(errors).toBeUndefined();

  return navigationMenuItems;
};

const createObjectWithNavigationMenuItems = async (suffix: string) => {
  const {
    data: { createOneObject },
    errors: createErrors,
  } = await createOneObjectMetadata({
    expectToFail: false,
    input: buildCreateObjectInput(suffix),
    gqlFields: 'id',
  });

  expect(createErrors).toBeUndefined();

  const objectMetadataId = createOneObject.id;

  const {
    data: { getViews },
  } = await findViews({
    objectMetadataId,
    gqlFields: 'id objectMetadataId',
    expectToFail: false,
  });

  const viewIds = getViews.map((view) => view.id);

  expect(viewIds.length).toBeGreaterThan(0);

  const {
    data: { createNavigationMenuItem: viewItem },
  } = await createNavigationMenuItem({
    expectToFail: false,
    input: { type: NavigationMenuItemType.VIEW, viewId: viewIds[0] },
    gqlFields: 'id',
  });

  const {
    data: { createNavigationMenuItem: recordItem },
  } = await createNavigationMenuItem({
    expectToFail: false,
    input: {
      type: NavigationMenuItemType.RECORD,
      targetRecordId: faker.string.uuid(),
      targetObjectMetadataId: objectMetadataId,
    },
    gqlFields: 'id',
  });

  const itemsBeforeDelete = findItemsReferencingObject({
    navigationMenuItems: await listNavigationMenuItems(),
    objectMetadataId,
    viewIds,
  });

  expect(itemsBeforeDelete.map((item) => item.type).sort()).toEqual(
    [
      NavigationMenuItemType.OBJECT,
      NavigationMenuItemType.RECORD,
      NavigationMenuItemType.VIEW,
    ].sort(),
  );

  return {
    objectMetadataId,
    viewIds,
    navigationMenuItemIds: [viewItem.id, recordItem.id],
  };
};

describe('Navigation menu item side effect on object metadata deletion', () => {
  const uniqueSuffix = Date.now().toString().slice(-8);

  let objectMetadataIdsToCleanUp: string[] = [];
  let navigationMenuItemIdsToCleanUp: string[] = [];

  afterEach(async () => {
    const remainingNavigationMenuItemIds = (await listNavigationMenuItems())
      .map((item) => item.id)
      .filter((id) => navigationMenuItemIdsToCleanUp.includes(id));

    for (const navigationMenuItemId of remainingNavigationMenuItemIds) {
      await deleteNavigationMenuItem({
        input: { id: navigationMenuItemId },
        expectToFail: false,
      });
    }

    for (const objectMetadataId of objectMetadataIdsToCleanUp) {
      await updateOneObjectMetadata({
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { isActive: false },
        },
      });

      await deleteOneObjectMetadata({
        input: { idToDelete: objectMetadataId },
      });
    }

    objectMetadataIdsToCleanUp = [];
    navigationMenuItemIdsToCleanUp = [];
  });

  it('should stop returning the navigation menu items of an active object deleted through the API, and keep the items of a live object', async () => {
    const deleted = await createObjectWithNavigationMenuItems(uniqueSuffix);
    const live = await createObjectWithNavigationMenuItems(
      `${uniqueSuffix}Live`,
    );

    objectMetadataIdsToCleanUp = [live.objectMetadataId];
    navigationMenuItemIdsToCleanUp = [
      ...deleted.navigationMenuItemIds,
      ...live.navigationMenuItemIds,
    ];

    const { errors: deleteErrors } = await deleteOneObjectMetadata({
      input: { idToDelete: deleted.objectMetadataId },
      expectToFail: false,
    });

    expect(deleteErrors).toBeUndefined();

    const itemsAfterDelete = await listNavigationMenuItems();

    expect(
      findItemsReferencingObject({
        navigationMenuItems: itemsAfterDelete,
        objectMetadataId: deleted.objectMetadataId,
        viewIds: deleted.viewIds,
      }),
    ).toEqual([]);

    expect(
      await findNavigationMenuItemRowsReferencingObject({
        objectMetadataId: deleted.objectMetadataId,
        viewIds: deleted.viewIds,
      }),
    ).toEqual([]);

    expect(
      findItemsReferencingObject({
        navigationMenuItems: itemsAfterDelete,
        objectMetadataId: live.objectMetadataId,
        viewIds: live.viewIds,
      }),
    ).toHaveLength(3);
  });

  it('should stop returning the navigation menu items of an object deactivated then deleted through the API', async () => {
    const deleted = await createObjectWithNavigationMenuItems(
      `${uniqueSuffix}Off`,
    );

    navigationMenuItemIdsToCleanUp = deleted.navigationMenuItemIds;

    const {
      data: { updateOneObject },
      errors: updateErrors,
    } = await updateOneObjectMetadata({
      input: {
        idToUpdate: deleted.objectMetadataId,
        updatePayload: { isActive: false },
      },
      gqlFields: 'id isActive',
      expectToFail: false,
    });

    expect(updateErrors).toBeUndefined();
    jestExpectToBeDefined(updateOneObject);
    expect(updateOneObject.isActive).toBe(false);

    const { errors: deleteErrors } = await deleteOneObjectMetadata({
      input: { idToDelete: deleted.objectMetadataId },
      expectToFail: false,
    });

    expect(deleteErrors).toBeUndefined();

    expect(
      findItemsReferencingObject({
        navigationMenuItems: await listNavigationMenuItems(),
        objectMetadataId: deleted.objectMetadataId,
        viewIds: deleted.viewIds,
      }),
    ).toEqual([]);

    expect(
      await findNavigationMenuItemRowsReferencingObject({
        objectMetadataId: deleted.objectMetadataId,
        viewIds: deleted.viewIds,
      }),
    ).toEqual([]);
  });
});
