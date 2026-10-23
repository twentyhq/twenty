import gql from 'graphql-tag';
import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import {
  findApplicationDefaultRole,
  findWorkspaceCustomApplicationId,
} from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { updateOneRole } from 'test/integration/metadata/suites/role/utils/update-one-role.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { PermissionFlagType } from 'twenty-shared/constants';

import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const ROLE_STATE_GQL_FIELDS = `
  id
  label
  description
  icon
  isEditable
  canUpdateAllSettings
  canAccessAllTools
  canAccessAllAgentChatChannels
  canReadAllObjectRecords
  canUpdateAllObjectRecords
  canSoftDeleteAllObjectRecords
  canDestroyAllObjectRecords
  canBeAssignedToUsers
  canBeAssignedToAgents
  canBeAssignedToApiKeys
  workspaceMembers { id }
  agents { id }
  apiKeys { id }
  permissionFlags { flag }
  objectPermissions { objectMetadataId }
  fieldPermissions { fieldMetadataId }
  rowLevelPermissionPredicates { id }
  rowLevelPermissionPredicateGroups { id }
`;

const readCustomApplicationRoleState = async () =>
  findApplicationDefaultRole({
    input: { id: await findWorkspaceCustomApplicationId() },
    gqlFields: ROLE_STATE_GQL_FIELDS,
  });

describe('A workspace Admin member cannot change the custom application role', () => {
  let customApplicationRoleId: string;
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;
  let agentId: string;

  beforeAll(async () => {
    const customApplicationRole = await readCustomApplicationRoleState();

    jestExpectToBeDefined(customApplicationRole);
    customApplicationRoleId = customApplicationRole.id;

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });
    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    companyObjectMetadataId = companyObjectMetadata.id;
    const companyNameFieldMetadata = companyObjectMetadata.fieldsList?.find(
      (field: { name: string }) => field.name === 'name',
    );

    jestExpectToBeDefined(companyNameFieldMetadata);
    companyNameFieldMetadataId = companyNameFieldMetadata.id;

    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Application default role assignment probe',
        prompt: 'Answer what you are asked',
        modelId: TEST_AI_MODEL_ID,
      },
    });

    agentId = data.createOneAgent.id;
  });

  afterAll(async () => {
    await deleteOneAgent({ expectToFail: false, input: { id: agentId } });
  });

  describe('custom application role', () => {
    let roleStateBefore: Awaited<
      ReturnType<typeof readCustomApplicationRoleState>
    >;
    const roleId = () => customApplicationRoleId;

    beforeAll(async () => {
      roleStateBefore = await readCustomApplicationRoleState();
    });

    afterAll(async () => {
      expect(await readCustomApplicationRoleState()).toEqual(roleStateBefore);
    });

    it('refuses updateOneRole', async () => {
      const { errors } = await updateOneRole({
        expectToFail: true,
        input: {
          idToUpdate: roleId(),
          updatePayload: { label: 'Renamed application role' },
        },
      });

      expect(errors?.[0]?.extensions?.code).toBeDefined();
      expect(JSON.stringify(errors)).toMatch(
        /not editable|cannot be assigned/i,
      );
    });

    it('refuses deleteOneRole', async () => {
      const { errors } = await deleteOneRole({
        expectToFail: true,
        input: { idToDelete: roleId() },
      });

      expect(errors?.[0]?.extensions?.code).toBeDefined();
      expect(JSON.stringify(errors)).toMatch(
        /not editable|cannot be assigned/i,
      );
    });

    it('refuses object permissions', async () => {
      const { errors } = await upsertObjectPermissions({
        expectToFail: true,
        input: {
          roleId: roleId(),
          objectPermissions: [
            {
              objectMetadataId: companyObjectMetadataId,
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
            },
          ],
        },
      });

      expect(errors?.[0]?.extensions?.code).toBeDefined();
      expect(JSON.stringify(errors)).toMatch(
        /not editable|cannot be assigned/i,
      );
    });

    it('refuses field permissions', async () => {
      const { errors } = await upsertFieldPermissions({
        expectToFail: true,
        input: {
          roleId: roleId(),
          fieldPermissions: [
            {
              objectMetadataId: companyObjectMetadataId,
              fieldMetadataId: companyNameFieldMetadataId,
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            },
          ],
        },
      });

      expect(errors?.[0]?.extensions?.code).toBeDefined();
      expect(JSON.stringify(errors)).toMatch(
        /not editable|cannot be assigned/i,
      );
    });

    it('refuses permission flags', async () => {
      const { errors } = await upsertPermissionFlags({
        expectToFail: true,
        input: {
          roleId: roleId(),
          permissionFlagKeys: [PermissionFlagType.WORKFLOWS],
        },
      });

      expect(errors?.[0]?.extensions?.code).toBeDefined();
      expect(JSON.stringify(errors)).toMatch(
        /not editable|cannot be assigned/i,
      );
    });

    it('refuses assigning it to a member', async () => {
      const { errors } = await updateWorkspaceMemberRole({
        expectToFail: true,
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: roleId(),
        },
      });

      expect(errors?.[0]?.extensions?.code).toBeDefined();
      expect(JSON.stringify(errors)).toMatch(
        /not editable|cannot be assigned/i,
      );
    });

    it('refuses assigning it to an API key', async () => {
      const response = await makeMetadataApiRequest({
        query: gql`
          mutation AssignRoleToApiKey($apiKeyId: UUID!, $roleId: UUID!) {
            assignRoleToApiKey(apiKeyId: $apiKeyId, roleId: $roleId)
          }
        `,
        variables: { apiKeyId: API_KEY_DATA_SEED_IDS.ID_1, roleId: roleId() },
      });

      expect(JSON.stringify(response.body.errors)).toMatch(
        /cannot be assigned/i,
      );
    });

    it('refuses assigning it to an agent', async () => {
      const response = await makeMetadataApiRequest({
        query: gql`
          mutation AssignRoleToAgent($agentId: UUID!, $roleId: UUID!) {
            assignRoleToAgent(agentId: $agentId, roleId: $roleId)
          }
        `,
        variables: { agentId, roleId: roleId() },
      });

      expect(JSON.stringify(response.body.errors)).toMatch(
        /cannot be assigned/i,
      );
    });

    it.each([
      {
        toolName: 'update_role',
        toolArguments: () => ({
          roleId: roleId(),
          update: { label: 'Renamed application role' },
        }),
      },
      {
        toolName: 'delete_role',
        toolArguments: () => ({ roleId: roleId() }),
      },
      {
        toolName: 'upsert_object_permissions',
        toolArguments: () => ({
          roleId: roleId(),
          objectPermissions: [
            {
              objectMetadataId: companyObjectMetadataId,
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
            },
          ],
        }),
      },
      {
        toolName: 'assign_role_to_workspace_member',
        toolArguments: () => ({
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: roleId(),
        }),
      },
    ])(
      'refuses the $toolName role tool',
      async ({ toolName, toolArguments }) => {
        const output = await executeToolThroughMcp({
          toolName,
          toolArguments: toolArguments(),
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        expect(output.success).toBe(false);
        expect(output.error).toMatch(/not editable|cannot be assigned/);
      },
    );
  });
});
