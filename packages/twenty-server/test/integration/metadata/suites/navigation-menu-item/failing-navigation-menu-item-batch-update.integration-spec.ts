import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { updateManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/update-many-navigation-menu-items.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type UpdateOneNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';

type TestContext = {
  buildInputs: (itemId: string) => UpdateOneNavigationMenuItemInput[];
};

const failingBatchUpdateTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when updating with non-existent id',
    context: {
      buildInputs: () => [
        {
          id: faker.string.uuid(),
          update: { position: 5 },
        },
      ],
    },
  },
  {
    title: 'when updating with invalid folderId',
    context: {
      buildInputs: (itemId: string) => [
        {
          id: itemId,
          update: { folderId: 'not-a-valid-uuid' },
        },
      ],
    },
  },
  {
    title: 'when batch contains an update for non-existent item',
    context: {
      buildInputs: (itemId: string) => [
        {
          id: itemId,
          update: { position: 10 },
        },
        {
          id: faker.string.uuid(),
          update: { position: 20 },
        },
      ],
    },
  },
];

describe('NavigationMenuItem batch update should fail', () => {
  let createdNavigationMenuItemId: string;
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
    const { data } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        type: NavigationMenuItemType.RECORD,
        targetRecordId: faker.string.uuid(),
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
  });

  it.each(eachTestingContextFilter(failingBatchUpdateTestCases))(
    '$title',
    async ({ context }) => {
      const inputs = context.buildInputs(createdNavigationMenuItemId);

      const { errors } = await updateManyNavigationMenuItems({
        expectToFail: true,
        inputs,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
