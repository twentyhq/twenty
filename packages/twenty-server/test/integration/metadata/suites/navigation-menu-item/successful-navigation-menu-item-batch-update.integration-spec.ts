import { faker } from '@faker-js/faker';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { createManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-many-navigation-menu-items.util';
import { deleteManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-many-navigation-menu-items.util';
import { updateManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/update-many-navigation-menu-items.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('NavigationMenuItem batch update should succeed', () => {
  let personObjectMetadataId: string;
  let createdIds: string[] = [];

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

  afterEach(async () => {
    if (createdIds.length > 0) {
      await deleteManyNavigationMenuItems({
        ids: createdIds,
        expectToFail: false,
      });
      createdIds = [];
    }
  });

  it('should update positions of multiple items at once', async () => {
    const { data: createData } = await createManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: personObjectMetadataId,
          position: 1,
        },
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: personObjectMetadataId,
          position: 2,
        },
      ],
    });

    jestExpectToBeDefined(createData?.createManyNavigationMenuItems);
    const items = createData.createManyNavigationMenuItems;
    createdIds = items.map((item) => item.id);

    const { data: updateData } = await updateManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        { id: items[0].id, update: { position: 10 } },
        { id: items[1].id, update: { position: 20 } },
      ],
    });

    jestExpectToBeDefined(updateData?.updateManyNavigationMenuItems);

    const updatedItems = updateData.updateManyNavigationMenuItems;

    expect(updatedItems).toHaveLength(2);
    expect(updatedItems[0]).toMatchObject({
      id: items[0].id,
      position: 10,
    });
    expect(updatedItems[1]).toMatchObject({
      id: items[1].id,
      position: 20,
    });
  });

  it('should update folderIds of multiple items at once', async () => {
    const folderId = faker.string.uuid();

    const { data: createData } = await createManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        {
          id: folderId,
          type: NavigationMenuItemType.FOLDER,
          name: 'Batch Folder',
          position: 1,
        },
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: personObjectMetadataId,
          position: 1,
        },
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: personObjectMetadataId,
          position: 2,
        },
      ],
    });

    jestExpectToBeDefined(createData?.createManyNavigationMenuItems);
    const items = createData.createManyNavigationMenuItems;
    createdIds = items.map((item) => item.id);

    const { data: updateData } = await updateManyNavigationMenuItems({
      expectToFail: false,
      inputs: [
        { id: items[1].id, update: { folderId } },
        { id: items[2].id, update: { folderId } },
      ],
    });

    jestExpectToBeDefined(updateData?.updateManyNavigationMenuItems);

    const updatedItems = updateData.updateManyNavigationMenuItems;

    expect(updatedItems).toHaveLength(2);
    expect(updatedItems[0]).toMatchObject({ id: items[1].id, folderId });
    expect(updatedItems[1]).toMatchObject({ id: items[2].id, folderId });
  });

  it('should return empty array for empty inputs', async () => {
    const { data } = await updateManyNavigationMenuItems({
      expectToFail: false,
      inputs: [],
    });

    jestExpectToBeDefined(data?.updateManyNavigationMenuItems);
    expect(data.updateManyNavigationMenuItems).toHaveLength(0);
  });
});
