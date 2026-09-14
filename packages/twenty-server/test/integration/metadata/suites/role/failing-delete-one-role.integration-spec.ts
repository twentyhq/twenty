import { faker } from '@faker-js/faker';
import { gql } from 'graphql-tag';
import { revokeApiKey } from 'test/integration/graphql/utils/revoke-api-key.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
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

      expect(errors).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors),
      );
    },
  );

  it('when deleting a role still assigned to an active API key while the default role cannot be assigned to API keys', async () => {
    const { data: createRoleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Role Held By An Active API Key',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: true,
      },
    });

    const roleId = createRoleData.createOneRole.id;

    const createApiKeyResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation CreateApiKey($input: CreateApiKeyInput!) {
          createApiKey(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          name: 'API key holding the role to delete',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          roleId,
        },
      },
    });

    const apiKeyId = createApiKeyResponse.body.data?.createApiKey?.id;

    jestExpectToBeDefined(apiKeyId);

    try {
      const { errors } = await deleteOneRole({
        expectToFail: true,
        input: {
          idToDelete: roleId,
        },
      });

      expect(errors).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors),
      );
    } finally {
      await revokeApiKey({ apiKeyId });

      await deleteOneRole({
        expectToFail: false,
        input: {
          idToDelete: roleId,
        },
      });

      await global.testDataSource.query(
        'DELETE FROM core."apiKey" WHERE id = $1',
        [apiKeyId],
      );
    }
  });
});
