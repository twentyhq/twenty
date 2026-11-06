import { createAgentForRole } from 'test/integration/permissions/utils/create-agent-for-role.util';
import { createApiKeyForRole } from 'test/integration/permissions/utils/create-api-key-for-role.util';
import { createWebhookForRole } from 'test/integration/permissions/utils/create-webhook-for-role.util';
import { addWorkspaceMemberWithRole } from 'test/integration/permissions/utils/add-workspace-member-with-role.util';
import { createActiveWorkspaceWithAdmin } from 'test/integration/permissions/utils/create-active-workspace-with-admin.util';
import { createApplicationWithDefaultRole } from 'test/integration/permissions/utils/create-application-with-default-role.util';
import { createOauthOnlyApplication } from 'test/integration/permissions/utils/create-oauth-only-application.util';
import { createRecordAccessObject } from 'test/integration/permissions/utils/create-record-access-object.util';
import {
  createRecordAccessRecord,
  type RecordAccessRecordFixture,
} from 'test/integration/permissions/utils/create-record-access-record.util';
import { createRecordAccessRole } from 'test/integration/permissions/utils/create-record-access-role.util';
import { measureSetupStep } from 'test/integration/permissions/utils/measure-setup-step.util';
import {
  type RecordAccessRecordName,
  type RecordAccessWorkspace,
} from 'test/integration/permissions/utils/record-access-workspace.type';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';

import { type RoleGrant } from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';

const OBJECT_NAME_SINGULAR = 'accessRecord';
const OBJECT_NAME_PLURAL = 'accessRecords';
const ROLE_GRANTS: RoleGrant[] = ['none', 'rowLevel', 'allRecords'];

const mapRoleGrants = async <TValue>(
  build: (grant: RoleGrant) => Promise<TValue>,
): Promise<Record<RoleGrant, TValue>> => {
  const values = await Promise.all(ROLE_GRANTS.map(build));

  return Object.fromEntries(
    ROLE_GRANTS.map((grant, index) => [grant, values[index]]),
  ) as Record<RoleGrant, TValue>;
};

const mapRoleGrantsInSequence = async <TValue>(
  build: (grant: RoleGrant) => Promise<TValue>,
): Promise<Record<RoleGrant, TValue>> => {
  const values = {} as Record<RoleGrant, TValue>;

  for (const grant of ROLE_GRANTS) {
    values[grant] = await build(grant);
  }

  return values;
};

export const createRecordAccessWorkspace =
  async (): Promise<RecordAccessWorkspace> => {
    const { workspaceId, workspaceOrigin, inviteHash, adminAccessToken } =
      await measureSetupStep({
        step: 'workspace sign up and activation',
        run: createActiveWorkspaceWithAdmin,
      });

    await measureSetupStep({
      step: 'sharing feature flag on',
      run: () =>
        updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
          value: true,
          workspaceId,
          expectToFail: false,
        }),
    });

    const { objectMetadataId, objectUniversalIdentifier, fields } =
      await measureSetupStep({
        step: 'object with 3 fields',
        run: () =>
          createRecordAccessObject({
            nameSingular: OBJECT_NAME_SINGULAR,
            namePlural: OBJECT_NAME_PLURAL,
            accessToken: adminAccessToken,
          }),
      });

    const buildRoles = ({
      labelPrefix,
      fieldMetadataId,
      value,
    }: {
      labelPrefix: string;
      fieldMetadataId: string;
      value: string;
    }) =>
      mapRoleGrantsInSequence((grant) =>
        createRecordAccessRole({
          label: `${labelPrefix} ${grant}`,
          grant,
          rowLevelFilter: { fieldMetadataId, value },
          objectMetadataId,
          accessToken: adminAccessToken,
        }),
      );

    const { mainRoleIds, limitingRoleIds } = await measureSetupStep({
      step: '6 roles with 2 row level filters',
      run: async () => ({
        mainRoleIds: await buildRoles({
          labelPrefix: 'Main',
          fieldMetadataId: fields.status.id,
          value: 'active',
        }),
        limitingRoleIds: await buildRoles({
          labelPrefix: 'Limiting',
          fieldMetadataId: fields.category.id,
          value: 'core',
        }),
      }),
    });

    const members = await measureSetupStep({
      step: '3 workspace members',
      run: () =>
        mapRoleGrantsInSequence((grant) =>
          addWorkspaceMemberWithRole({
            workspaceId,
            workspaceOrigin,
            inviteHash,
            roleId: mainRoleIds[grant],
            adminAccessToken,
          }),
        ),
    });

    const apiKeyIds = await measureSetupStep({
      step: '3 API keys',
      run: () =>
        mapRoleGrants((grant) =>
          createApiKeyForRole({
            roleId: mainRoleIds[grant],
            accessToken: adminAccessToken,
          }),
        ),
    });

    const webhookId = await measureSetupStep({
      step: '1 webhook',
      run: () =>
        createWebhookForRole({
          roleId: mainRoleIds.allRecords,
          accessToken: adminAccessToken,
        }),
    });

    const { limitingAgentIds, mainAgentId } = await measureSetupStep({
      step: '4 agents',
      run: async () => ({
        limitingAgentIds: await mapRoleGrantsInSequence((grant) =>
          createAgentForRole({
            name: `limiting${grant}Agent`,
            roleId: limitingRoleIds[grant],
            accessToken: adminAccessToken,
          }),
        ),
        mainAgentId: await createAgentForRole({
          name: 'mainAgent',
          roleId: mainRoleIds.allRecords,
          accessToken: adminAccessToken,
        }),
      }),
    });

    const { applicationIds, mainApplicationId } = await measureSetupStep({
      step: '4 applications',
      run: async () => ({
        applicationIds: await mapRoleGrantsInSequence((grant) =>
          createApplicationWithDefaultRole({
            name: `Application ${grant}`,
            grant,
            rowLevelFilter: {
              fieldUniversalIdentifier: fields.region.universalIdentifier,
              value: 'europe',
            },
            objectUniversalIdentifier,
            accessToken: adminAccessToken,
          }),
        ),
        mainApplicationId: await createApplicationWithDefaultRole({
          name: 'Main application',
          grant: 'allRecords',
          objectUniversalIdentifier,
          accessToken: adminAccessToken,
        }),
      }),
    });

    const oauthApplicationId = await measureSetupStep({
      step: '1 OAuth application',
      run: () => createOauthOnlyApplication({ accessToken: adminAccessToken }),
    });

    const noAccessMember = {
      workspaceMemberId: members.none.workspaceMemberId,
    };
    const allRecordsMember = {
      workspaceMemberId: members.allRecords.workspaceMemberId,
    };
    const recordFixtures: Record<
      RecordAccessRecordName,
      RecordAccessRecordFixture
    > = {
      insideEveryFilter: {},
      outsideStatusFilter: { status: 'archived' },
      outsideCategoryFilter: { category: 'other' },
      outsideRegionFilter: { region: 'americas' },
      sharedReadToNoAccessMember: {
        share: {
          principal: noAccessMember,
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      sharedWriteToNoAccessMember: {
        share: {
          principal: noAccessMember,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
        },
      },
      sharedFullToNoAccessMember: {
        share: {
          principal: noAccessMember,
          accessLevel: RecordShareAccessLevel.FULL,
        },
      },
      sharedReadToAnotherMember: {
        share: {
          principal: allRecordsMember,
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      sharedReadToNoAccessRole: {
        share: {
          principal: { roleId: mainRoleIds.none },
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      privateSharedFullToAllRecordsMember: {
        isPrivate: true,
        share: {
          principal: allRecordsMember,
          accessLevel: RecordShareAccessLevel.FULL,
        },
      },
      privateSharedWriteToAllRecordsMember: {
        isPrivate: true,
        share: {
          principal: allRecordsMember,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
        },
      },
    };

    const recordIds = await measureSetupStep({
      step: '11 records with shares',
      run: async () =>
        Object.fromEntries(
          await Promise.all(
            Object.entries(recordFixtures).map(async ([name, fixture]) => [
              name,
              await createRecordAccessRecord({
                objectNameSingular: OBJECT_NAME_SINGULAR,
                objectMetadataId,
                fixture,
                accessToken: adminAccessToken,
              }),
            ]),
          ),
        ) as Record<RecordAccessRecordName, string>,
    });

    return {
      workspaceId,
      adminAccessToken,
      objectMetadataId,
      objectNameSingular: OBJECT_NAME_SINGULAR,
      mainRoleIds,
      members,
      apiKeyIds,
      webhookId,
      limitingAgentIds,
      mainAgentId,
      applicationIds,
      mainApplicationId,
      oauthApplicationId,
      recordIds,
    };
  };
