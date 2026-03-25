import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';

type TestContext = {
  input: CreateNavigationMenuItemInput;
};

const failingNavigationMenuItemCreationTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when creating with missing targetRecordId',
      context: {
        input: {
          type: NavigationMenuItemType.RECORD,
          targetObjectMetadataId: faker.string.uuid(),
        } as CreateNavigationMenuItemInput,
      },
    },
    {
      title: 'when creating with empty targetRecordId',
      context: {
        input: {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: '',
          targetObjectMetadataId: faker.string.uuid(),
        },
      },
    },
    {
      title: 'when creating with invalid targetRecordId (not a UUID)',
      context: {
        input: {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: 'not-a-valid-uuid',
          targetObjectMetadataId: faker.string.uuid(),
        },
      },
    },
    {
      title: 'when creating with missing targetObjectMetadataId',
      context: {
        input: {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
        } as CreateNavigationMenuItemInput,
      },
    },
    {
      title: 'when creating with empty targetObjectMetadataId',
      context: {
        input: {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: '',
        },
      },
    },
    {
      title: 'when creating with invalid targetObjectMetadataId (not a UUID)',
      context: {
        input: {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: 'not-a-valid-uuid',
        },
      },
    },
    {
      title: 'when creating with invalid userWorkspaceId (not a UUID)',
      context: {
        input: {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: faker.string.uuid(),
          userWorkspaceId: 'not-a-valid-uuid',
        },
      },
    },
    {
      title: 'when creating with invalid folderId (not a UUID)',
      context: {
        input: {
          type: NavigationMenuItemType.RECORD,
          targetRecordId: faker.string.uuid(),
          targetObjectMetadataId: faker.string.uuid(),
          folderId: 'not-a-valid-uuid',
        },
      },
    },
  ];

describe('NavigationMenuItem creation should fail', () => {
  it.each(eachTestingContextFilter(failingNavigationMenuItemCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createNavigationMenuItem({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
