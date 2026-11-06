import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createApiKey } from 'test/integration/graphql/utils/create-api-key.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { createWebhook } from 'test/integration/metadata/suites/utils/webhook-test.util';
import { addPermissionTestWorkspaceMember } from 'test/integration/permissions/utils/add-permission-test-workspace-member.util';
import { createPermissionTestActiveWorkspace } from 'test/integration/permissions/utils/create-permission-test-active-workspace.util';
import { createPermissionTestApplication } from 'test/integration/permissions/utils/create-permission-test-application.util';
import { authorizePermissionTestOauthApplicationOrThrow } from 'test/integration/permissions/utils/authorize-permission-test-oauth-application.util';
import { createPermissionTestObject } from 'test/integration/permissions/utils/create-permission-test-object.util';
import { createPermissionTestRole } from 'test/integration/permissions/utils/create-permission-test-role.util';
import {
  type PermissionTestWorkspace,
  type PermissionTestRoleGrant,
} from 'test/integration/permissions/utils/permission-test-workspace.type';
import { capitalize } from 'twenty-shared/utils';

const OBJECT_NAME_SINGULAR = 'accessRecord';

const buildForEachPermissionTestRoleGrant = async <TValue>(
  build: (grant: PermissionTestRoleGrant) => Promise<TValue>,
) => ({
  none: await build('none'),
  rowLevel: await build('rowLevel'),
  allRecords: await build('allRecords'),
});

export const createPermissionTestWorkspace =
  async (): Promise<PermissionTestWorkspace> => {
    const {
      workspaceId,
      workspaceOrigin,
      inviteHash,
      adminAccessToken: accessToken,
    } = await createPermissionTestActiveWorkspace();
    const { objectMetadataId, objectUniversalIdentifier, fields } =
      await createPermissionTestObject({
        nameSingular: OBJECT_NAME_SINGULAR,
        namePlural: `${OBJECT_NAME_SINGULAR}s`,
        accessToken,
      });

    const roleIds = await buildForEachPermissionTestRoleGrant((grant) =>
      createPermissionTestRole({
        label: `Main ${grant}`,
        grant,
        rowLevelFilter: { fieldMetadataId: fields.status.id, value: 'active' },
        objectMetadataId,
        accessToken,
      }),
    );
    const limitingRoleIds = await buildForEachPermissionTestRoleGrant((grant) =>
      createPermissionTestRole({
        label: `Limiting ${grant}`,
        grant,
        rowLevelFilter: { fieldMetadataId: fields.category.id, value: 'core' },
        objectMetadataId,
        accessToken,
      }),
    );

    const createRecord = async (values: object): Promise<string> => {
      const response = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: OBJECT_NAME_SINGULAR,
          gqlFields: 'id',
          data: {
            status: 'active',
            category: 'core',
            region: 'europe',
            ...values,
          },
        }),
        accessToken,
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data[`create${capitalize(OBJECT_NAME_SINGULAR)}`].id;
    };

    const createAgent = async (input: {
      name: string;
      roleId?: string;
    }): Promise<string> => {
      const { data } = await createOneAgent({
        input: {
          ...input,
          label: input.name,
          prompt: 'Permission test agent',
          modelId: TEST_AI_MODEL_ID,
        },
        gqlFields: 'id',
        expectToFail: false,
        token: accessToken,
      });

      return data.createOneAgent.id;
    };

    const createApiKeyForRole = async (grant: PermissionTestRoleGrant) => {
      const response = await createApiKey({
        name: `Permission test ${grant}`,
        expiresAt: '2099-01-01T00:00:00Z',
        roleId: roleIds[grant],
        accessToken,
      });

      expect(response.body.errors).toBeUndefined();

      const apiKeyId: string = response.body.data.createApiKey.id;

      return apiKeyId;
    };

    const webhookResponse = await createWebhook({
      input: {
        targetUrl: 'https://example.com/webhook',
        operations: ['*.*'],
        roleId: roleIds.allRecords,
      },
      token: accessToken,
    });

    expect(webhookResponse.body.errors).toBeUndefined();

    return {
      workspaceId,
      objectMetadataId,
      objectNameSingular: OBJECT_NAME_SINGULAR,
      roleIds,
      workspaceMemberIds: await buildForEachPermissionTestRoleGrant((grant) =>
        addPermissionTestWorkspaceMember({
          workspaceId,
          workspaceOrigin,
          inviteHash,
          roleId: roleIds[grant],
          adminAccessToken: accessToken,
        }),
      ),
      apiKeyIds: await buildForEachPermissionTestRoleGrant(createApiKeyForRole),
      webhookId: webhookResponse.body.data.createWebhook.id,
      limitingAgentIds: await buildForEachPermissionTestRoleGrant((grant) =>
        createAgent({
          name: `limiting${grant}Agent`,
          roleId: limitingRoleIds[grant],
        }),
      ),
      limitingAgentWithoutRoleId: await createAgent({
        name: 'limitingAgentWithoutRole',
      }),
      mainAgentId: await createAgent({
        name: 'mainAgent',
        roleId: roleIds.allRecords,
      }),
      applicationIds: await buildForEachPermissionTestRoleGrant((grant) =>
        createPermissionTestApplication({
          name: `Application ${grant}`,
          grant,
          rowLevelFilter: {
            fieldUniversalIdentifier: fields.region.universalIdentifier,
            value: 'europe',
          },
          objectUniversalIdentifier,
          accessToken,
        }),
      ),
      mainApplicationId: await createPermissionTestApplication({
        name: 'Main application',
        grant: 'allRecords',
        rowLevelFilter: {
          fieldUniversalIdentifier: fields.region.universalIdentifier,
          value: 'europe',
        },
        objectUniversalIdentifier,
        accessToken,
      }),
      oauthApplicationId: await authorizePermissionTestOauthApplicationOrThrow({
        accessToken,
      }),
      recordIds: {
        insideEveryFilter: await createRecord({}),
        outsideStatusFilter: await createRecord({ status: 'archived' }),
        outsideCategoryFilter: await createRecord({ category: 'other' }),
        outsideRegionFilter: await createRecord({ region: 'americas' }),
      },
    };
  };
