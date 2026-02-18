import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { updateNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/update-navigation-menu-item.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('Navigation Menu Item update should fail with circular dependency', () => {
  let folderId: string;
  let parentFolderId: string;
  let childFolderId: string;

  beforeAll(async () => {
    const { data: folderData } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        name: 'Standalone Folder',
      },
    });

    folderId = folderData?.createNavigationMenuItem?.id;
    jestExpectToBeDefined(folderId);

    const { data: parentFolderData } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        name: 'Parent Folder',
      },
    });

    parentFolderId = parentFolderData?.createNavigationMenuItem?.id;
    jestExpectToBeDefined(parentFolderId);

    const { data: childFolderData } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        name: 'Child Folder',
        folderId: parentFolderId,
      },
    });

    childFolderId = childFolderData?.createNavigationMenuItem?.id;
    jestExpectToBeDefined(childFolderId);
  });

  afterAll(async () => {
    if (childFolderId) {
      await deleteNavigationMenuItem({
        expectToFail: false,
        input: { id: childFolderId },
      });
    }

    if (parentFolderId) {
      await deleteNavigationMenuItem({
        expectToFail: false,
        input: { id: parentFolderId },
      });
    }

    if (folderId) {
      await deleteNavigationMenuItem({
        expectToFail: false,
        input: { id: folderId },
      });
    }
  });

  it('when folderId equals id (self-reference)', async () => {
    const { errors } = await updateNavigationMenuItem({
      expectToFail: true,
      input: {
        id: folderId,
        update: {
          folderId: folderId,
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('when update creates a circular dependency chain', async () => {
    const { errors } = await updateNavigationMenuItem({
      expectToFail: true,
      input: {
        id: parentFolderId,
        update: {
          folderId: childFolderId,
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
