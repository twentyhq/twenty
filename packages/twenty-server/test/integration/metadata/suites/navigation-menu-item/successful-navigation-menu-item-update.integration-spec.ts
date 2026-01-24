import { faker } from '@faker-js/faker';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { updateNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/update-navigation-menu-item.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('NavigationMenuItem update should succeed', () => {
  let createdNavigationMenuItemId: string;
  let personObjectMetadataId: string;
  let createdFolderId: string | undefined;

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

  beforeEach(async () => {
    const targetRecordId = faker.string.uuid();

    const { data } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        targetRecordId,
        targetObjectMetadataId: personObjectMetadataId,
        position: 1,
      },
    });

    createdNavigationMenuItemId = data.createNavigationMenuItem.id;
  });

  afterEach(async () => {
    if (createdNavigationMenuItemId) {
      await deleteNavigationMenuItem({
        expectToFail: false,
        input: { id: createdNavigationMenuItemId },
      });
      createdNavigationMenuItemId = undefined as unknown as string;
    }
    if (createdFolderId) {
      await deleteNavigationMenuItem({
        expectToFail: false,
        input: { id: createdFolderId },
      });
      createdFolderId = undefined;
    }
  });

  it('should update the position', async () => {
    const { data } = await updateNavigationMenuItem({
      expectToFail: false,
      input: {
        id: createdNavigationMenuItemId,
        update: {
          position: 10,
        },
      },
    });

    expect(data.updateNavigationMenuItem).toMatchObject({
      id: createdNavigationMenuItemId,
      position: 10,
    });
  });

  it('should update the folderId', async () => {
    const folderTargetRecordId = faker.string.uuid();

    const { data: folderData } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        targetRecordId: folderTargetRecordId,
        targetObjectMetadataId: personObjectMetadataId,
      },
    });

    const folderId = folderData?.createNavigationMenuItem?.id;

    jestExpectToBeDefined(folderId);
    createdFolderId = folderId;

    const { data } = await updateNavigationMenuItem({
      expectToFail: false,
      input: {
        id: createdNavigationMenuItemId,
        update: {
          folderId,
        },
      },
    });

    expect(data.updateNavigationMenuItem).toMatchObject({
      id: createdNavigationMenuItemId,
      folderId,
    });
  });

  it('should update folderId to null', async () => {
    const folderTargetRecordId = faker.string.uuid();

    const { data: folderData } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        targetRecordId: folderTargetRecordId,
        targetObjectMetadataId: personObjectMetadataId,
      },
    });

    const folderId = folderData?.createNavigationMenuItem?.id;

    jestExpectToBeDefined(folderId);
    createdFolderId = folderId;

    await updateNavigationMenuItem({
      expectToFail: false,
      input: {
        id: createdNavigationMenuItemId,
        update: {
          folderId,
        },
      },
    });

    const { data } = await updateNavigationMenuItem({
      expectToFail: false,
      input: {
        id: createdNavigationMenuItemId,
        update: {
          folderId: null,
        },
      },
    });

    expect(data.updateNavigationMenuItem).toMatchObject({
      id: createdNavigationMenuItemId,
      folderId: null,
    });
  });

  it('should update multiple fields at once', async () => {
    const folderTargetRecordId = faker.string.uuid();

    const { data: folderData } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        targetRecordId: folderTargetRecordId,
        targetObjectMetadataId: personObjectMetadataId,
      },
    });

    const folderId = folderData?.createNavigationMenuItem?.id;

    jestExpectToBeDefined(folderId);
    createdFolderId = folderId;

    const { data } = await updateNavigationMenuItem({
      expectToFail: false,
      input: {
        id: createdNavigationMenuItemId,
        update: {
          folderId,
          position: 99,
        },
      },
    });

    expect(data.updateNavigationMenuItem).toMatchObject({
      id: createdNavigationMenuItemId,
      folderId,
      position: 99,
    });
  });
});
