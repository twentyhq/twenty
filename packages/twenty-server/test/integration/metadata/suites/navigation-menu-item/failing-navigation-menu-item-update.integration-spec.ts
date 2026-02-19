import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { updateNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/update-navigation-menu-item.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type UpdateOneNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';

type TestContext = {
  input: (testSetup: TestSetup) => UpdateOneNavigationMenuItemInput;
};

type TestSetup = {
  testNavigationMenuItemId: string;
};

describe('NavigationMenuItem update should fail', () => {
  let testNavigationMenuItemId: string;
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

    testNavigationMenuItemId = data.createNavigationMenuItem.id;
  });

  afterEach(async () => {
    if (testNavigationMenuItemId) {
      await deleteNavigationMenuItem({
        expectToFail: false,
        input: { id: testNavigationMenuItemId },
      });
    }
  });

  const failingNavigationMenuItemUpdateTestCases: EachTestingContext<TestContext>[] =
    [
      {
        title: 'when updating with missing id',
        context: {
          input: () =>
            ({
              id: '',
              update: {
                position: 10,
              },
            }) as UpdateOneNavigationMenuItemInput,
        },
      },
      {
        title: 'when updating with empty id',
        context: {
          input: () => ({
            id: '',
            update: {
              position: 10,
            },
          }),
        },
      },
      {
        title: 'when updating with invalid id (not a UUID)',
        context: {
          input: () => ({
            id: 'not-a-valid-uuid',
            update: {
              position: 10,
            },
          }),
        },
      },
      {
        title: 'when updating a non-existent navigation menu item',
        context: {
          input: () => ({
            id: faker.string.uuid(),
            update: {
              position: 10,
            },
          }),
        },
      },
      {
        title: 'when updating with invalid folderId (not a UUID)',
        context: {
          input: (testSetup) => ({
            id: testSetup.testNavigationMenuItemId,
            update: {
              folderId: 'not-a-valid-uuid',
            },
          }),
        },
      },
    ];

  it.each(eachTestingContextFilter(failingNavigationMenuItemUpdateTestCases))(
    '$title',
    async ({ context }) => {
      const testSetup: TestSetup = {
        testNavigationMenuItemId,
      };

      const input = context.input(testSetup);

      const { errors } = await updateNavigationMenuItem({
        expectToFail: true,
        input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
