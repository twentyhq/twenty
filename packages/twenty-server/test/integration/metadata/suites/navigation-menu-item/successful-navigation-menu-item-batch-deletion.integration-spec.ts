import { faker } from '@faker-js/faker';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { createManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-many-navigation-menu-items.util';
import { deleteManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-many-navigation-menu-items.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('NavigationMenuItem batch deletion should succeed', () => {
  let personObjectMetadataId: string;
  let pendingCleanupIds: string[] = [];

  afterEach(async () => {
    if (pendingCleanupIds.length > 0) {
      await deleteManyNavigationMenuItems({
        ids: pendingCleanupIds,
        expectToFail: false,
      });
      pendingCleanupIds = [];
    }
  });

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        nameSingular
      `,
    });

    jestExpectToBeDefined(objects);

    const personObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'person',
    );

    jestExpectToBeDefined(personObjectMetadata);

    personObjectMetadataId = personObjectMetadata.id;
  });

  it('should delete multiple items in a single batch', async () => {
    const { data: createData } = await createManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: personObjectMetadataId,
        },
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: personObjectMetadataId,
        },
      ],
    });

    jestExpectToBeDefined(createData?.createManyNavigationMenuItems);
    const items = createData.createManyNavigationMenuItems;
    const idsToDelete = items.map((item) => item.id);

    pendingCleanupIds = [...idsToDelete];

    const { data: deleteData } = await deleteManyNavigationMenuItems({
      ids: idsToDelete,
      expectToFail: false,
    });

    pendingCleanupIds = [];

    jestExpectToBeDefined(deleteData?.deleteManyNavigationMenuItems);
    expect(deleteData.deleteManyNavigationMenuItems).toHaveLength(2);

    const { data: findData } = await findNavigationMenuItems({
      expectToFail: false,
      input: undefined,
    });

    for (const deletedId of idsToDelete) {
      const foundItem = findData.navigationMenuItems.find(
        (item) => item.id === deletedId,
      );
      expect(foundItem).toBeUndefined();
    }
  });

  it('should delete a folder and cascade to its children', async () => {
    const folderId = faker.string.uuid();

    const { data: createData } = await createManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        {
          id: folderId,
          type: NavigationMenuItemType.FOLDER,
          name: 'Cascade Folder',
          position: 1,
        },
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: personObjectMetadataId,
          folderId,
          position: 1,
        },
      ],
    });

    jestExpectToBeDefined(createData?.createManyNavigationMenuItems);
    const items = createData.createManyNavigationMenuItems;
    const childId = items[1].id;

    pendingCleanupIds = items.map((item) => item.id);

    const { data: deleteData } = await deleteManyNavigationMenuItems({
      ids: [folderId],
      expectToFail: false,
    });

    pendingCleanupIds = [];

    jestExpectToBeDefined(deleteData?.deleteManyNavigationMenuItems);
    expect(deleteData.deleteManyNavigationMenuItems).toHaveLength(1);

    const { data: findData } = await findNavigationMenuItems({
      expectToFail: false,
      input: undefined,
    });

    expect(
      findData.navigationMenuItems.find((item) => item.id === folderId),
    ).toBeUndefined();

    expect(
      findData.navigationMenuItems.find((item) => item.id === childId),
    ).toBeUndefined();
  });

  it('should handle deduplication of ids', async () => {
    const { data: createData } = await createManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: personObjectMetadataId,
        },
      ],
    });

    jestExpectToBeDefined(createData?.createManyNavigationMenuItems);
    const itemId = createData.createManyNavigationMenuItems[0].id;

    pendingCleanupIds = [itemId];

    const { data: deleteData } = await deleteManyNavigationMenuItems({
      ids: [itemId, itemId],
      expectToFail: false,
    });

    pendingCleanupIds = [];

    jestExpectToBeDefined(deleteData?.deleteManyNavigationMenuItems);
    expect(deleteData.deleteManyNavigationMenuItems).toHaveLength(1);
  });

  it('should return empty array for empty ids', async () => {
    const { data } = await deleteManyNavigationMenuItems({
      ids: [],
      expectToFail: false,
    });

    jestExpectToBeDefined(data?.deleteManyNavigationMenuItems);
    expect(data.deleteManyNavigationMenuItems).toHaveLength(0);
  });
});
