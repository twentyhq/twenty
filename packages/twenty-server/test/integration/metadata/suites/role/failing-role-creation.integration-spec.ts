import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role.input';

type TestContext = {
  input: CreateRoleInput;
};

type CreateOneRoleTestingContext = EachTestingContext<TestContext>[];

describe('Role creation should fail', () => {
  const failingRoleCreationTestCases: CreateOneRoleTestingContext = [
    // Missing required properties tests
    {
      title: 'when label is missing',
      context: {
        input: {
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        } as CreateRoleInput,
      },
    },
    // Read/Write permissions consistency tests
    {
      title:
        'when canReadAllObjectRecords is false but canUpdateAllObjectRecords is true',
      context: {
        input: {
          label: 'Inconsistent Update Role',
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        },
      },
    },
    {
      title:
        'when canReadAllObjectRecords is false but canSoftDeleteAllObjectRecords is true',
      context: {
        input: {
          label: 'Inconsistent Soft Delete Role',
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: false,
        },
      },
    },
    {
      title:
        'when canReadAllObjectRecords is false but canDestroyAllObjectRecords is true',
      context: {
        input: {
          label: 'Inconsistent Destroy Role',
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: true,
        },
      },
    },
    {
      title:
        'when canReadAllObjectRecords is false but multiple write permissions are true',
      context: {
        input: {
          label: 'Inconsistent Multiple Write Role',
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
        },
      },
    },
  ];

  it.each(eachTestingContextFilter(failingRoleCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneRole({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
