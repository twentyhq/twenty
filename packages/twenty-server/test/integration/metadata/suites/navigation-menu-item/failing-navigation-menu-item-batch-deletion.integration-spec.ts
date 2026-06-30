import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { deleteManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-many-navigation-menu-items.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

type TestContext = {
  buildIds: (realItemId: string) => string[];
};

const failingBatchDeletionTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when deleting with non-existent id',
    context: {
      buildIds: () => [faker.string.uuid()],
    },
  },
  {
    title: 'when batch contains a non-existent id among valid ones',
    context: {
      buildIds: (realItemId: string) => [realItemId, faker.string.uuid()],
    },
  },
];

describe('NavigationMenuItem batch deletion should fail', () => {
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

  it.each(eachTestingContextFilter(failingBatchDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const ids = context.buildIds(createdNavigationMenuItemId);

      const { errors } = await deleteManyNavigationMenuItems({
        expectToFail: true,
        ids,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
