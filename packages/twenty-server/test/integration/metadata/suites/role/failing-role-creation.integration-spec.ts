import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';

type TestContext = {
  input: CreateRoleInput;
};

type GlobalTestContext = {
  existingRoleLabel: string;
};

const globalTestContext: GlobalTestContext = {
  existingRoleLabel: 'Existing Test Role',
};

type CreateOneRoleTestingContext = EachTestingContext<TestContext>[];

describe('Role creation should fail', () => {
  let existingRoleId: string | undefined;

  beforeAll(async () => {
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: globalTestContext.existingRoleLabel,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    existingRoleId = data.createOneRole.id;
  });

  afterAll(async () => {
    if (isDefined(existingRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: existingRoleId },
      });
    }
  });

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
    // Label uniqueness test
    {
      title: 'when label already exists',
      context: {
        input: {
          label: globalTestContext.existingRoleLabel,
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        },
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
