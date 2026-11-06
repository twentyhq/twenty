import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { addWorkspaceMemberWithRole } from 'test/integration/permissions/utils/add-workspace-member-with-role.util';
import { createActiveWorkspaceWithAdmin } from 'test/integration/permissions/utils/create-active-workspace-with-admin.util';
import { createAgentForRole } from 'test/integration/permissions/utils/create-agent-for-role.util';
import { createAgentWithoutRole } from 'test/integration/permissions/utils/create-agent-without-role.util';
import { createApiKeyForRole } from 'test/integration/permissions/utils/create-api-key-for-role.util';
import { createApplicationWithDefaultRole } from 'test/integration/permissions/utils/create-application-with-default-role.util';
import { authorizeOauthOnlyApplicationOrThrow } from 'test/integration/permissions/utils/authorize-oauth-only-application.util';
import { createRecordAccessObject } from 'test/integration/permissions/utils/create-record-access-object.util';
import { createRecordAccessRole } from 'test/integration/permissions/utils/create-record-access-role.util';
import { createWebhookForRole } from 'test/integration/permissions/utils/create-webhook-for-role.util';
import {
  type RecordAccessWorkspace,
  type RoleGrant,
} from 'test/integration/permissions/utils/record-access-workspace.type';
import { capitalize } from 'twenty-shared/utils';

const OBJECT_NAME_SINGULAR = 'accessRecord';

const buildForEachRoleGrant = async <TValue>(
  build: (grant: RoleGrant) => Promise<TValue>,
) => ({
  none: await build('none'),
  rowLevel: await build('rowLevel'),
  allRecords: await build('allRecords'),
});

export const createRecordAccessWorkspace =
  async (): Promise<RecordAccessWorkspace> => {
    const {
      workspaceId,
      workspaceOrigin,
      inviteHash,
      adminAccessToken: accessToken,
    } = await createActiveWorkspaceWithAdmin();
    const { objectMetadataId, objectUniversalIdentifier, fields } =
      await createRecordAccessObject({
        nameSingular: OBJECT_NAME_SINGULAR,
        namePlural: `${OBJECT_NAME_SINGULAR}s`,
        accessToken,
      });

    const roleIds = await buildForEachRoleGrant((grant) =>
      createRecordAccessRole({
        label: `Main ${grant}`,
        grant,
        rowLevelFilter: { fieldMetadataId: fields.status.id, value: 'active' },
        objectMetadataId,
        accessToken,
      }),
    );
    const limitingRoleIds = await buildForEachRoleGrant((grant) =>
      createRecordAccessRole({
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

    return {
      workspaceId,
      objectMetadataId,
      objectNameSingular: OBJECT_NAME_SINGULAR,
      roleIds,
      workspaceMemberIds: await buildForEachRoleGrant((grant) =>
        addWorkspaceMemberWithRole({
          workspaceId,
          workspaceOrigin,
          inviteHash,
          roleId: roleIds[grant],
          adminAccessToken: accessToken,
        }),
      ),
      apiKeyIds: await buildForEachRoleGrant((grant) =>
        createApiKeyForRole({ roleId: roleIds[grant], accessToken }),
      ),
      webhookId: await createWebhookForRole({
        roleId: roleIds.allRecords,
        accessToken,
      }),
      limitingAgentIds: await buildForEachRoleGrant((grant) =>
        createAgentForRole({
          name: `limiting${grant}Agent`,
          roleId: limitingRoleIds[grant],
          accessToken,
        }),
      ),
      limitingAgentWithoutRoleId: await createAgentWithoutRole({
        name: 'limitingAgentWithoutRole',
        accessToken,
      }),
      mainAgentId: await createAgentForRole({
        name: 'mainAgent',
        roleId: roleIds.allRecords,
        accessToken,
      }),
      applicationIds: await buildForEachRoleGrant((grant) =>
        createApplicationWithDefaultRole({
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
      mainApplicationId: await createApplicationWithDefaultRole({
        name: 'Main application',
        grant: 'allRecords',
        rowLevelFilter: {
          fieldUniversalIdentifier: fields.region.universalIdentifier,
          value: 'europe',
        },
        objectUniversalIdentifier,
        accessToken,
      }),
      oauthApplicationId: await authorizeOauthOnlyApplicationOrThrow({
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
