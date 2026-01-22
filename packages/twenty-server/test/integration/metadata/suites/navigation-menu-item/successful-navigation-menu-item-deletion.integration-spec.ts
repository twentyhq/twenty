import { faker } from '@faker-js/faker';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('NavigationMenuItem deletion should succeed', () => {
  let personObjectMetadataId: string;

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

  it('should delete an existing navigation menu item', async () => {
    const targetRecordId = faker.string.uuid();

    const { data: createData } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        targetRecordId,
        targetObjectMetadataId: personObjectMetadataId,
      },
    });

    const createdId = createData.createNavigationMenuItem.id;

    const { data: deleteData } = await deleteNavigationMenuItem({
      expectToFail: false,
      input: { id: createdId },
    });

    expect(deleteData.deleteNavigationMenuItem).toMatchObject({
      id: createdId,
      targetRecordId,
    });

    const { data: findData } = await findNavigationMenuItems({
      expectToFail: false,
      input: undefined,
    });

    const deletedItem = findData.navigationMenuItems.find(
      (item) => item.id === createdId,
    );

    expect(deletedItem).toBeUndefined();
  });
});
