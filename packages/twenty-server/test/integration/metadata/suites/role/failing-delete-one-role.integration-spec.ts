import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

type TestContext = {
  input: (testSetup: TestSetup) => {
    idToDelete: string;
  };
};

type TestSetup = {
  adminRoleId: string;
  memberRoleId: string;
};

type GlobalTestContext = {
  adminRoleId: string;
  memberRoleId: string;
};

const globalTestContext: GlobalTestContext = {
  adminRoleId: '',
  memberRoleId: '',
};

type DeleteOneRoleTestingContext = EachTestingContext<TestContext>[];

describe('Role deletion should fail', () => {
  beforeAll(async () => {
    const adminRole = await findOneRoleByLabel({ label: 'Admin' });
    const memberRole = await findOneRoleByLabel({ label: 'Member' });

    globalTestContext.adminRoleId = adminRole.id;
    globalTestContext.memberRoleId = memberRole.id;
  });

  const failingRoleDeletionTestCases: DeleteOneRoleTestingContext = [
    {
      title: 'when deleting a non-editable system role (Admin)',
      context: {
        input: (testSetup) => ({
          idToDelete: testSetup.adminRoleId,
        }),
      },
    },
    {
      title: 'when deleting the workspace default role (Member)',
      context: {
        input: (testSetup) => ({
          idToDelete: testSetup.memberRoleId,
        }),
      },
    },
    {
      title: 'when deleting a non-existent role',
      context: {
        input: () => ({
          idToDelete: faker.string.uuid(),
        }),
      },
    },
  ];

  it.each(eachTestingContextFilter(failingRoleDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const testSetup: TestSetup = {
        adminRoleId: globalTestContext.adminRoleId,
        memberRoleId: globalTestContext.memberRoleId,
      };

      const { idToDelete } = context.input(testSetup);

      const { errors } = await deleteOneRole({
        expectToFail: true,
        input: {
          idToDelete,
        },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
