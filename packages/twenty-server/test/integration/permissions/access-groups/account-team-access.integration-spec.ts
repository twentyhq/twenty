/* @license Enterprise */
import { type AccessTestLogin } from 'test/integration/permissions/access-groups/utils/access-test-login.type';
import { createAccessTestLogins } from 'test/integration/permissions/access-groups/utils/create-access-test-logins.util';
import { createAccessTestManyToOneField } from 'test/integration/permissions/access-groups/utils/create-access-test-many-to-one-field.util';
import { createAccessTestObject } from 'test/integration/permissions/access-groups/utils/create-access-test-object.util';
import { createAccessTestRecord } from 'test/integration/permissions/access-groups/utils/create-access-test-record.util';
import { findFieldMetadataIdByName } from 'test/integration/permissions/access-groups/utils/find-field-metadata-id-by-name.util';
import { findInverseFieldMetadataId } from 'test/integration/permissions/access-groups/utils/find-inverse-field-metadata-id.util';
import { findObjectMetadataIdByName } from 'test/integration/permissions/access-groups/utils/find-object-metadata-id-by-name.util';
import { findOpportunityAccess } from 'test/integration/permissions/access-groups/utils/find-opportunity-access.util';
import { listRecordIdsWithGraphql } from 'test/integration/permissions/access-groups/utils/list-record-ids-with-graphql.util';
import { queryTestDatabase } from 'test/integration/permissions/access-groups/utils/query-test-database.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  FeatureFlagKey,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { findAccessGroupValueLookups } from 'src/engine/permissions/internal/access-group/value-lookup/utils/find-access-group-value-lookups.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const SCHEMA = `"${getWorkspaceSchemaName(workspaceId)}"`;
const ACCOUNT_TEAM_MEMBER = 'accountTeamMember';
const FEATURE_FLAGS = [
  FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
  FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
  FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
];

describe('Account team access (integration)', () => {
  const metadataIds: Record<string, string> = {};
  const recordIds: Record<string, string> = {};
  let logins: Record<'teamMember' | 'outsider', AccessTestLogin>;

  const syncAndRecompute = async () => {
    await waitForAllJobsToFinish();
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
      'rlsWorkspaceMemberRelationValueMaps',
    ]);
    await getAppProviderByClassName<AccessGroupSyncService>(
      'AccessGroupSyncService',
    ).syncAccessGroups({ workspaceId });
    await waitForAllJobsToFinish();
  };

  const findCompactAccessGroupIds = async (objectName: string) =>
    queryTestDatabase<{ id: string; accessGroupIds: number[] }>({
      sql: `SELECT "id", "_accessGroupIds" AS "accessGroupIds" FROM ${SCHEMA}."${objectName}" ORDER BY "id"`,
    });

  const countFullRecomputeSteps = async () => {
    const [{ count }] = await queryTestDatabase<{ count: string }>({
      sql: `SELECT count(*) FROM core."deferredWorkspaceOperation", jsonb_array_elements("payload"->'objectComputes') AS "step"
        WHERE "workspaceId" = $1 AND "name" = 'compute_recordAccessGroupIds' AND NOT "step" ? 'accessGroupIdChanges'`,
      parameters: [workspaceId],
    });

    return Number(count);
  };

  const createOpportunityWithNote = async ({
    name,
    accountId,
  }: {
    name: string;
    accountId: string;
  }) => {
    recordIds[name] = await createAccessTestRecord({
      objectName: 'opportunity',
      data: { name, companyId: accountId },
    });
    recordIds[`${name}Note`] = await createAccessTestRecord({
      objectName: 'note',
      data: { title: `Note of ${name}` },
    });
    await createAccessTestRecord({
      objectName: 'noteTarget',
      data: {
        noteId: recordIds[`${name}Note`],
        targetOpportunityId: recordIds[name],
      },
    });
  };

  const joinAccountTeam = ({
    login,
    accountId,
  }: {
    login: Pick<AccessTestLogin, 'workspaceMemberId'>;
    accountId: string;
  }) =>
    createAccessTestRecord({
      objectName: ACCOUNT_TEAM_MEMBER,
      data: { accountId, memberId: login.workspaceMemberId },
    });

  beforeAll(async () => {
    for (const featureFlag of FEATURE_FLAGS) {
      await updateFeatureFlag({
        expectToFail: false,
        featureFlag,
        value: true,
      });
    }

    metadataIds.opportunity = await findObjectMetadataIdByName({
      workspaceId,
      nameSingular: 'opportunity',
    });
    metadataIds.note = await findObjectMetadataIdByName({
      workspaceId,
      nameSingular: 'note',
    });
    metadataIds.noteTarget = await findObjectMetadataIdByName({
      workspaceId,
      nameSingular: 'noteTarget',
    });
    metadataIds.accountTeamMember = await createAccessTestObject({
      nameSingular: ACCOUNT_TEAM_MEMBER,
    });
    metadataIds.accountTeamMemberAccount = await createAccessTestManyToOneField(
      {
        objectMetadataId: metadataIds.accountTeamMember,
        targetObjectMetadataId: await findObjectMetadataIdByName({
          workspaceId,
          nameSingular: 'company',
        }),
        name: 'account',
        targetFieldLabel: 'Account team',
      },
    );
    metadataIds.workspaceMemberAccountTeams = await findInverseFieldMetadataId({
      fieldMetadataId: await createAccessTestManyToOneField({
        objectMetadataId: metadataIds.accountTeamMember,
        targetObjectMetadataId: await findObjectMetadataIdByName({
          workspaceId,
          nameSingular: 'workspaceMember',
        }),
        name: 'member',
        targetFieldLabel: 'Account teams',
      }),
    });

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: `Account team ${v4()}`,
        description: 'Account team',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });
    const roleId = data.createOneRole.id;

    await revokeObjectRecordsPermissions({
      roleId,
      objectMetadataId: metadataIds.opportunity,
    });
    // Notes are only reached through the opportunities they are attached to
    await revokeObjectRecordsPermissions({
      roleId,
      objectMetadataId: metadataIds.note,
    });
    await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId: metadataIds.opportunity,
        rules: [
          {
            canReadRecords: true,
            canUpdateRecords: true,
            predicates: [
              {
                id: v4(),
                fieldMetadataId: await findFieldMetadataIdByName({
                  objectMetadataId: metadataIds.opportunity,
                  name: 'company',
                }),
                operand: RowLevelPermissionPredicateOperand.IS,
                workspaceMemberRelationFieldMetadataId:
                  metadataIds.workspaceMemberAccountTeams,
                workspaceMemberFieldMetadataId:
                  metadataIds.accountTeamMemberAccount,
              },
            ],
          },
        ],
      },
    });

    const [teamMember, outsider] = await createAccessTestLogins({
      workspaceId,
      count: 2,
    });

    logins = { teamMember, outsider };

    for (const login of Object.values(logins)) {
      await updateWorkspaceMemberRole({
        expectToFail: false,
        input: { workspaceMemberId: login.workspaceMemberId, roleId },
      });
    }

    recordIds.accountX = await createAccessTestRecord({
      objectName: 'company',
      data: { name: 'Account X' },
    });
    recordIds.accountY = await createAccessTestRecord({
      objectName: 'company',
      data: { name: 'Account Y' },
    });
    await createOpportunityWithNote({
      name: 'opportunityX',
      accountId: recordIds.accountX,
    });
    await createOpportunityWithNote({
      name: 'opportunityY',
      accountId: recordIds.accountY,
    });
    await joinAccountTeam({
      login: logins.teamMember,
      accountId: recordIds.accountX,
    });
    await syncAndRecompute();

    const computationService =
      getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
      );

    for (const objectMetadataId of [
      metadataIds.opportunity,
      metadataIds.noteTarget,
      metadataIds.note,
    ]) {
      await computationService.recomputeRecordAccessGroupIdsOfAllObjectRecords({
        workspaceId,
        objectMetadataId,
      });
    }
  }, 300_000);

  it('should look up the account team rule by value', async () => {
    const metadataMaps =
      await getAppProviderByClassName<RecordAccessGroupMetadataMapsService>(
        'RecordAccessGroupMetadataMapsService',
      ).findAfterEvictingLocalCache(workspaceId);

    expect(
      findAccessGroupValueLookups({
        flatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: metadataIds.opportunity,
          flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
        }),
        metadataMaps,
      }).flatMap(({ type, keys }) =>
        keys.map(({ columnName }) => `${type}:${columnName}`),
      ),
    ).toEqual(['RLS_MEMBER_VALUE:companyId']);
  });

  it('should give team members access to the opportunities and notes of their accounts', async () => {
    const opportunityIds = [recordIds.opportunityX, recordIds.opportunityY];

    expect(
      await findOpportunityAccess({ login: logins.teamMember, opportunityIds }),
    ).toEqual({
      [recordIds.opportunityX]: 'Edit',
      [recordIds.opportunityY]: 'None',
    });
    expect(
      await findOpportunityAccess({ login: logins.outsider, opportunityIds }),
    ).toEqual({
      [recordIds.opportunityX]: 'None',
      [recordIds.opportunityY]: 'None',
    });
    expect(
      await listRecordIdsWithGraphql({
        login: logins.teamMember,
        objectName: 'note',
        ids: [recordIds.opportunityXNote, recordIds.opportunityYNote],
      }),
    ).toEqual([recordIds.opportunityXNote]);
  });

  it('should grant a member joining an existing team without recomputing opportunities', async () => {
    const opportunityAccessGroupIdsBefore =
      await findCompactAccessGroupIds('opportunity');
    const fullRecomputeStepsBefore = await countFullRecomputeSteps();

    await joinAccountTeam({
      login: logins.outsider,
      accountId: recordIds.accountX,
    });
    await syncAndRecompute();

    expect(await countFullRecomputeSteps()).toBe(fullRecomputeStepsBefore);
    expect(await findCompactAccessGroupIds('opportunity')).toEqual(
      opportunityAccessGroupIdsBefore,
    );
    expect(
      await findOpportunityAccess({
        login: logins.outsider,
        opportunityIds: [recordIds.opportunityX],
      }),
    ).toEqual({ [recordIds.opportunityX]: 'Edit' });
  });

  it('should only change the records of an account getting its first team member', async () => {
    const accountZ = await createAccessTestRecord({
      objectName: 'company',
      data: { name: 'Account Z' },
    });

    await createOpportunityWithNote({
      name: 'opportunityZ',
      accountId: accountZ,
    });
    await syncAndRecompute();

    const fullRecomputeStepsBefore = await countFullRecomputeSteps();
    const otherOpportunitiesBefore = (
      await findCompactAccessGroupIds('opportunity')
    ).filter(({ id }) => id !== recordIds.opportunityZ);

    await joinAccountTeam({ login: logins.teamMember, accountId: accountZ });
    await syncAndRecompute();

    expect(await countFullRecomputeSteps()).toBe(fullRecomputeStepsBefore);
    expect(
      (await findCompactAccessGroupIds('opportunity')).filter(
        ({ id }) => id !== recordIds.opportunityZ,
      ),
    ).toEqual(otherOpportunitiesBefore);
    expect(
      await findOpportunityAccess({
        login: logins.teamMember,
        opportunityIds: [recordIds.opportunityZ],
      }),
    ).toEqual({ [recordIds.opportunityZ]: 'Edit' });
    expect(
      await listRecordIdsWithGraphql({
        login: logins.teamMember,
        objectName: 'note',
        ids: [recordIds.opportunityZNote],
      }),
    ).toEqual([recordIds.opportunityZNote]);
  });
});
