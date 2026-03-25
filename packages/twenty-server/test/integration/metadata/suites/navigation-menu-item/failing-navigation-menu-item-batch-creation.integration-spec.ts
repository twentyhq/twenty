import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-many-navigation-menu-items.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';

type TestContext = {
  inputs: CreateNavigationMenuItemInput[];
};

const failingBatchCreationTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when batch contains item with missing targetRecordId',
    context: {
      inputs: [
        {
          type: NavigationMenuItemType.RECORD,
          targetObjectMetadataId: faker.string.uuid(),
        } as CreateNavigationMenuItemInput,
      ],
    },
  },
  {
    title: 'when batch contains item with invalid targetRecordId',
    context: {
      inputs: [
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: 'not-a-valid-uuid',
          targetObjectMetadataId: faker.string.uuid(),
        },
      ],
    },
  },
  {
    title: 'when batch contains item with invalid targetObjectMetadataId',
    context: {
      inputs: [
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: 'not-a-valid-uuid',
        },
      ],
    },
  },
  {
    title: 'when batch contains item with invalid folderId',
    context: {
      inputs: [
        {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: faker.string.uuid(),
          folderId: 'not-a-valid-uuid',
        },
      ],
    },
  },
];

describe('NavigationMenuItem batch creation should fail', () => {
  it.each(eachTestingContextFilter(failingBatchCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createManyNavigationMenuItems({
        expectToFail: true,
        inputs: context.inputs,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
