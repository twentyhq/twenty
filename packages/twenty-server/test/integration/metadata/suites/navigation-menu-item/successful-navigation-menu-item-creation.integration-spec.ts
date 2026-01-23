import { faker } from '@faker-js/faker';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('NavigationMenuItem creation should succeed', () => {
  let createdNavigationMenuItemId: string;
  let companyObjectMetadataId: string;
  let personObjectMetadataId: string;
  let validUserWorkspaceId: string | null;
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

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );
    const personObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'person',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    jestExpectToBeDefined(personObjectMetadata);

    companyObjectMetadataId = companyObjectMetadata.id;
    personObjectMetadataId = personObjectMetadata.id;

    const { data: currentUserData } = await getCurrentUser({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    jestExpectToBeDefined(currentUserData?.currentUser?.currentUserWorkspace);

    validUserWorkspaceId =
      currentUserData?.currentUser?.currentUserWorkspace?.id ?? null;
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

  it('should create a basic navigation menu item with minimal input', async () => {
    const targetRecordId = faker.string.uuid();

    const { data } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        targetRecordId,
        targetObjectMetadataId: personObjectMetadataId,
      },
    });

    createdNavigationMenuItemId = data?.createNavigationMenuItem?.id;

    expect(data.createNavigationMenuItem).toMatchObject({
      id: expect.any(String),
      targetRecordId,
      targetObjectMetadataId: personObjectMetadataId,
      userWorkspaceId: null,
      folderId: null,
      position: expect.any(Number),
    });
  });

  it('should create navigation menu item with all optional fields', async () => {
    const targetRecordId = faker.string.uuid();
    const folderTargetRecordId = faker.string.uuid();

    const { data: folderData } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        targetRecordId: folderTargetRecordId,
        targetObjectMetadataId: companyObjectMetadataId,
        userWorkspaceId: validUserWorkspaceId ?? undefined,
      },
    });

    const folderId = folderData?.createNavigationMenuItem?.id;

    jestExpectToBeDefined(folderId);
    createdFolderId = folderId;

    const { data } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        targetRecordId,
        targetObjectMetadataId: companyObjectMetadataId,
        userWorkspaceId: validUserWorkspaceId ?? undefined,
        folderId,
        position: 5,
      },
    });

    createdNavigationMenuItemId = data?.createNavigationMenuItem?.id;

    expect(data.createNavigationMenuItem).toMatchObject({
      id: expect.any(String),
      targetRecordId,
      targetObjectMetadataId: companyObjectMetadataId,
      userWorkspaceId: validUserWorkspaceId,
      folderId,
      position: 5,
    });
  });

  it('should auto-calculate position when not provided', async () => {
    const targetRecordId1 = faker.string.uuid();
    const targetRecordId2 = faker.string.uuid();

    const { data: data1 } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        targetRecordId: targetRecordId1,
        targetObjectMetadataId: personObjectMetadataId,
      },
    });

    const firstItemId = data1.createNavigationMenuItem.id;
    const firstPosition = data1.createNavigationMenuItem.position;

    const { data: data2 } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        targetRecordId: targetRecordId2,
        targetObjectMetadataId: personObjectMetadataId,
      },
    });

    createdNavigationMenuItemId = data2.createNavigationMenuItem.id;

    expect(data2.createNavigationMenuItem.position).toBeGreaterThan(
      firstPosition,
    );

    await deleteNavigationMenuItem({
      expectToFail: false,
      input: { id: firstItemId },
    });
  });
});
