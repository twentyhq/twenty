/* @license Enterprise */
import { type AccessTestLogin } from 'test/integration/permissions/access-groups/utils/access-test-login.type';
import { createAccessTestLogins } from 'test/integration/permissions/access-groups/utils/create-access-test-logins.util';
import { createAccessTestManyToOneField } from 'test/integration/permissions/access-groups/utils/create-access-test-many-to-one-field.util';
import { createAccessTestObject } from 'test/integration/permissions/access-groups/utils/create-access-test-object.util';
import { createAccessTestRecord } from 'test/integration/permissions/access-groups/utils/create-access-test-record.util';
import { createAccessTestSelectField } from 'test/integration/permissions/access-groups/utils/create-access-test-select-field.util';
import { findFieldMetadataIdByName } from 'test/integration/permissions/access-groups/utils/find-field-metadata-id-by-name.util';
import { findInverseFieldMetadataId } from 'test/integration/permissions/access-groups/utils/find-inverse-field-metadata-id.util';
import { findObjectMetadataIdByName } from 'test/integration/permissions/access-groups/utils/find-object-metadata-id-by-name.util';
import { findOpportunityAccess } from 'test/integration/permissions/access-groups/utils/find-opportunity-access.util';
import { listRecordIdsWithGraphql } from 'test/integration/permissions/access-groups/utils/list-record-ids-with-graphql.util';
import { queryTestDatabase } from 'test/integration/permissions/access-groups/utils/query-test-database.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
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
const OPPORTUNITY_TEAM_MEMBER = 'opportunityTeamMember';
const ACCOUNT_CLIENT_HEAD = 'accountClientHead';
const FEATURE_FLAGS = [
  FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
  FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
  FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
];

describe('Account team access (integration)', () => {
  const metadataIds: Record<string, string> = {};
  const recordIds: Record<string, string> = {};
  let logins: Record<
    'clientHead' | 'opportunityTeamMember' | 'partner' | 'accountTeamMember',
    AccessTestLogin
  >;
  let roleId: string;

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

  const recomputeAll = async () => {
    const computationService =
      getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
      );

    for (const objectName of ['opportunity', 'noteTarget', 'note']) {
      await computationService.recomputeRecordAccessGroupIdsOfAllObjectRecords({
        workspaceId,
        objectMetadataId: await findObjectMetadataIdByName({
          workspaceId,
          nameSingular: objectName,
        }),
      });
    }
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
    metadataIds.company = await findObjectMetadataIdByName({
      workspaceId,
      nameSingular: 'company',
    });
    metadataIds.workspaceMember = await findObjectMetadataIdByName({
      workspaceId,
      nameSingular: 'workspaceMember',
    });
    metadataIds.accountTeamMember = await createAccessTestObject({
      nameSingular: ACCOUNT_TEAM_MEMBER,
    });
    metadataIds.opportunityTeamMember = await createAccessTestObject({
      nameSingular: OPPORTUNITY_TEAM_MEMBER,
    });
    metadataIds.accountClientHead = await createAccessTestObject({
      nameSingular: ACCOUNT_CLIENT_HEAD,
    });

    metadataIds.accountTeamMemberAccount = await createAccessTestManyToOneField(
      {
        objectMetadataId: metadataIds.accountTeamMember,
        targetObjectMetadataId: metadataIds.company,
        name: 'account',
        targetFieldLabel: 'Account team',
      },
    );
    metadataIds.accountTeamMemberMember = await createAccessTestManyToOneField({
      objectMetadataId: metadataIds.accountTeamMember,
      targetObjectMetadataId: metadataIds.workspaceMember,
      name: 'member',
      targetFieldLabel: 'Account teams',
    });
    metadataIds.workspaceMemberAccountTeams = await findInverseFieldMetadataId({
      fieldMetadataId: metadataIds.accountTeamMemberMember,
    });
    metadataIds.accountClientHeadAccount = await createAccessTestManyToOneField(
      {
        objectMetadataId: metadataIds.accountClientHead,
        targetObjectMetadataId: metadataIds.company,
        name: 'account',
        targetFieldLabel: 'Client heads',
      },
    );
    metadataIds.accountClientHeadMember = await createAccessTestManyToOneField({
      objectMetadataId: metadataIds.accountClientHead,
      targetObjectMetadataId: metadataIds.workspaceMember,
      name: 'member',
      targetFieldLabel: 'Client head accounts',
    });
    metadataIds.workspaceMemberClientHeadAccounts =
      await findInverseFieldMetadataId({
        fieldMetadataId: metadataIds.accountClientHeadMember,
      });
    metadataIds.opportunityTeamMemberOpportunity =
      await createAccessTestManyToOneField({
        objectMetadataId: metadataIds.opportunityTeamMember,
        targetObjectMetadataId: metadataIds.opportunity,
        name: 'opportunity',
        targetFieldLabel: 'Opportunity team',
      });
    metadataIds.opportunityOpportunityTeam = await findInverseFieldMetadataId({
      fieldMetadataId: metadataIds.opportunityTeamMemberOpportunity,
    });
    metadataIds.opportunityTeamMemberMember =
      await createAccessTestManyToOneField({
        objectMetadataId: metadataIds.opportunityTeamMember,
        targetObjectMetadataId: metadataIds.workspaceMember,
        name: 'member',
        targetFieldLabel: 'Opportunity teams',
      });
    metadataIds.opportunityPractice = await createAccessTestSelectField({
      objectMetadataId: metadataIds.opportunity,
      name: 'practice',
      values: ['ADVISORY', 'AUDIT'],
    });
    metadataIds.opportunityWall = await createAccessTestSelectField({
      objectMetadataId: metadataIds.opportunity,
      name: 'wall',
      values: ['WALL_ONE', 'WALL_TWO'],
    });
    metadataIds.workspaceMemberPractice = await createAccessTestSelectField({
      objectMetadataId: metadataIds.workspaceMember,
      name: 'practice',
      values: ['ADVISORY', 'AUDIT'],
    });
    metadataIds.workspaceMemberClearedWalls = await createAccessTestSelectField(
      {
        objectMetadataId: metadataIds.workspaceMember,
        name: 'clearedWalls',
        values: ['WALL_ONE', 'WALL_TWO'],
        type: FieldMetadataType.MULTI_SELECT,
      },
    );
    metadataIds.opportunityCompany = await findFieldMetadataIdByName({
      objectMetadataId: metadataIds.opportunity,
      name: 'company',
    });
    metadataIds.workspaceMemberId = await findFieldMetadataIdByName({
      objectMetadataId: metadataIds.workspaceMember,
      name: 'id',
    });

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: `Deal team ${v4()}`,
        description: 'Deal team',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    roleId = data.createOneRole.id;
    await revokeObjectRecordsPermissions({
      roleId,
      objectMetadataId: metadataIds.opportunity,
    });
    // Notes are only reached through the opportunities they are attached to
    await revokeObjectRecordsPermissions({
      roleId,
      objectMetadataId: await findObjectMetadataIdByName({
        workspaceId,
        nameSingular: 'note',
      }),
    });

    const accountTeamPredicate = {
      fieldMetadataId: metadataIds.opportunityCompany,
      operand: RowLevelPermissionPredicateOperand.IS,
      workspaceMemberRelationFieldMetadataId:
        metadataIds.workspaceMemberAccountTeams,
      workspaceMemberFieldMetadataId: metadataIds.accountTeamMemberAccount,
    };
    const clientHeadRuleId = v4();

    await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId: metadataIds.opportunity,
        rules: [
          {
            canReadRecords: true,
            canUpdateRecords: true,
            predicates: [{ id: v4(), ...accountTeamPredicate }],
            predicateGroups: [
              {
                id: v4(),
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.OR,
                predicates: [
                  {
                    id: v4(),
                    fieldMetadataId: metadataIds.opportunityWall,
                    operand: RowLevelPermissionPredicateOperand.IS_EMPTY,
                  },
                  {
                    id: v4(),
                    fieldMetadataId: metadataIds.opportunityWall,
                    operand: RowLevelPermissionPredicateOperand.IS,
                    workspaceMemberFieldMetadataId:
                      metadataIds.workspaceMemberClearedWalls,
                  },
                ],
              },
            ],
          },
          {
            id: clientHeadRuleId,
            canReadRecords: true,
            predicates: [
              {
                id: v4(),
                fieldMetadataId: metadataIds.opportunityCompany,
                operand: RowLevelPermissionPredicateOperand.IS,
                workspaceMemberRelationFieldMetadataId:
                  metadataIds.workspaceMemberClientHeadAccounts,
                workspaceMemberFieldMetadataId:
                  metadataIds.accountClientHeadAccount,
              },
            ],
          },
          {
            canReadRecords: true,
            canUpdateRecords: true,
            predicates: [
              {
                id: v4(),
                relationFieldMetadataId: metadataIds.opportunityOpportunityTeam,
                fieldMetadataId: metadataIds.opportunityTeamMemberMember,
                operand: RowLevelPermissionPredicateOperand.IS,
                workspaceMemberFieldMetadataId: metadataIds.workspaceMemberId,
              },
            ],
          },
          {
            canReadRecords: true,
            predicates: [
              {
                id: v4(),
                fieldMetadataId: metadataIds.opportunityPractice,
                operand: RowLevelPermissionPredicateOperand.IS,
                workspaceMemberFieldMetadataId:
                  metadataIds.workspaceMemberPractice,
              },
              {
                id: v4(),
                fieldMetadataId: metadataIds.opportunityWall,
                operand: RowLevelPermissionPredicateOperand.IS_EMPTY,
              },
            ],
          },
        ],
      },
    });

    const [{ id: storedClientHeadRuleId }] = await queryTestDatabase<{
      id: string;
    }>({
      sql: `SELECT "rowLevelPermissionRuleId" AS "id" FROM core."rowLevelPermissionPredicate"
        WHERE "roleId" = $1 AND "workspaceMemberRelationFieldMetadataId" = $2`,
      parameters: [roleId, metadataIds.workspaceMemberClientHeadAccounts],
    });

    await queryTestDatabase({
      sql: `INSERT INTO core."fieldPermission" ("roleId", "objectMetadataId", "fieldMetadataId", "canReadFieldValue", "canUpdateFieldValue", "workspaceId", "universalIdentifier", "applicationId", "rowLevelPermissionRuleId")
        SELECT $1, "fieldMetadata"."objectMetadataId", "fieldMetadata"."id", FALSE, FALSE, $2, uuid_generate_v4(), "role"."applicationId", $3
        FROM core."fieldMetadata", core."role"
        WHERE "fieldMetadata"."objectMetadataId" = $4 AND "role"."id" = $1
          AND "fieldMetadata"."name" NOT IN ('id', 'name') AND "fieldMetadata"."isSystem" = FALSE`,
      parameters: [
        roleId,
        workspaceId,
        storedClientHeadRuleId,
        metadataIds.opportunity,
      ],
    });

    const [clientHead, opportunityTeamMember, partner, accountTeamMember] =
      await createAccessTestLogins({ workspaceId, count: 4 });

    logins = { clientHead, opportunityTeamMember, partner, accountTeamMember };

    for (const login of Object.values(logins)) {
      await updateWorkspaceMemberRole({
        expectToFail: false,
        input: { workspaceMemberId: login.workspaceMemberId, roleId },
      });
    }

    await queryTestDatabase({
      sql: `UPDATE ${SCHEMA}."workspaceMember" SET "practice" = 'ADVISORY' WHERE "id" = $1`,
      parameters: [logins.partner.workspaceMemberId],
    });
    await queryTestDatabase({
      sql: `UPDATE ${SCHEMA}."workspaceMember" SET "clearedWalls" = ARRAY['WALL_TWO']::${SCHEMA}."workspaceMember_clearedWalls_enum"[] WHERE "id" = $1`,
      parameters: [logins.clientHead.workspaceMemberId],
    });
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(workspaceId, ['flatWorkspaceMemberMaps']);

    recordIds.accountX = await createAccessTestRecord({
      objectName: 'company',
      data: { name: 'Account X' },
    });
    recordIds.accountY = await createAccessTestRecord({
      objectName: 'company',
      data: { name: 'Account Y' },
    });

    for (const [name, data] of [
      ['opportunity1', { companyId: recordIds.accountX }],
      ['opportunity2', { companyId: recordIds.accountX }],
      ['opportunity3', { companyId: recordIds.accountX }],
      ['walledOne', { companyId: recordIds.accountY, wall: 'WALL_ONE' }],
      ['walledTwo', { companyId: recordIds.accountY, wall: 'WALL_TWO' }],
      ['unwalled', { companyId: recordIds.accountY }],
    ] as const) {
      recordIds[name] = await createAccessTestRecord({
        objectName: 'opportunity',
        data: {
          name,
          practice: 'ADVISORY',
          ...data,
        },
      });
      recordIds[`${name}Note`] = await createAccessTestRecord({
        objectName: 'note',
        data: {
          title: `Note of ${name}`,
        },
      });
      await createAccessTestRecord({
        objectName: 'noteTarget',
        data: {
          noteId: recordIds[`${name}Note`],
          targetOpportunityId: recordIds[name],
        },
      });
    }

    for (const [workspaceMemberId, accountId] of [
      [logins.clientHead.workspaceMemberId, recordIds.accountX],
      [logins.clientHead.workspaceMemberId, recordIds.accountY],
      [logins.accountTeamMember.workspaceMemberId, recordIds.accountY],
    ]) {
      await createAccessTestRecord({
        objectName: ACCOUNT_TEAM_MEMBER,
        data: {
          accountId,
          memberId: workspaceMemberId,
        },
      });
    }

    for (const accountId of [recordIds.accountX, recordIds.accountY]) {
      await createAccessTestRecord({
        objectName: ACCOUNT_CLIENT_HEAD,
        data: {
          accountId,
          memberId: logins.clientHead.workspaceMemberId,
        },
      });
    }

    await createAccessTestRecord({
      objectName: OPPORTUNITY_TEAM_MEMBER,
      data: {
        opportunityId: recordIds.opportunity3,
        memberId: logins.opportunityTeamMember.workspaceMemberId,
      },
    });

    await syncAndRecompute();
    await recomputeAll();
  }, 300_000);

  it('should look up the member bound rules that read no other member value', async () => {
    const metadataMaps =
      await getAppProviderByClassName<RecordAccessGroupMetadataMapsService>(
        'RecordAccessGroupMetadataMapsService',
      ).findAfterEvictingLocalCache(workspaceId);
    const lookups = findAccessGroupValueLookups({
      flatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: metadataIds.opportunity,
        flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
      }),
      metadataMaps,
    }).filter(({ type }) => type === 'RLS_MEMBER_VALUE');

    expect(
      lookups
        .map(({ keys }) =>
          keys
            .map(
              ({ columnName, relationHop }) =>
                `${relationHop?.targetFlatObjectMetadata.nameSingular ?? 'opportunity'}.${columnName}`,
            )
            .join(','),
        )
        .sort(),
    ).toEqual(['opportunity.companyId', 'opportunity.practice']);
  });

  it('should give each login the expected access to the opportunities of an account', async () => {
    const opportunityIds = [
      recordIds.opportunity1,
      recordIds.opportunity2,
      recordIds.opportunity3,
    ];

    expect(
      await findOpportunityAccess({ login: logins.clientHead, opportunityIds }),
    ).toEqual({
      [recordIds.opportunity1]: 'Edit',
      [recordIds.opportunity2]: 'Edit',
      [recordIds.opportunity3]: 'Edit',
    });
    expect(
      await findOpportunityAccess({
        login: logins.opportunityTeamMember,
        opportunityIds,
      }),
    ).toEqual({
      [recordIds.opportunity1]: 'None',
      [recordIds.opportunity2]: 'None',
      [recordIds.opportunity3]: 'Edit',
    });
    expect(
      await findOpportunityAccess({ login: logins.partner, opportunityIds }),
    ).toEqual({
      [recordIds.opportunity1]: 'Read',
      [recordIds.opportunity2]: 'Read',
      [recordIds.opportunity3]: 'Read',
    });
  });

  it('should keep walled opportunities from logins not cleared for their wall', async () => {
    const opportunityIds = [
      recordIds.walledOne,
      recordIds.walledTwo,
      recordIds.unwalled,
    ];

    expect(
      await listRecordIdsWithGraphql({
        login: logins.clientHead,
        objectName: 'opportunity',
        ids: opportunityIds,
      }),
    ).toEqual([...opportunityIds].sort());
    expect(
      await listRecordIdsWithGraphql({
        login: logins.accountTeamMember,
        objectName: 'opportunity',
        ids: opportunityIds,
      }),
    ).toEqual([recordIds.unwalled]);
    expect(
      await listRecordIdsWithGraphql({
        login: logins.partner,
        objectName: 'opportunity',
        ids: opportunityIds,
      }),
    ).toEqual([recordIds.unwalled]);

    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id name practice',
        filter: { id: { in: [recordIds.walledOne, recordIds.walledTwo] } },
      }),
      logins.clientHead.token,
    );
    const nodeById = Object.fromEntries(
      response.body.data.opportunities.edges.map(
        ({ node }: { node: { id: string } }) => [node.id, node],
      ),
    );

    expect(nodeById[recordIds.walledOne]).toMatchObject({
      name: 'walledOne',
      practice: null,
    });
    expect(nodeById[recordIds.walledTwo]).toMatchObject({
      name: 'walledTwo',
      practice: 'ADVISORY',
    });
  });

  it('should let notes follow the opportunity they are attached to', async () => {
    const noteIds = [
      'opportunity1Note',
      'opportunity2Note',
      'opportunity3Note',
      'walledOneNote',
      'walledTwoNote',
      'unwalledNote',
    ].map((name) => recordIds[name]);
    const listNotes = (login: Pick<AccessTestLogin, 'token'>) =>
      listRecordIdsWithGraphql({ login, objectName: 'note', ids: noteIds });

    expect(await listNotes(logins.opportunityTeamMember)).toEqual([
      recordIds.opportunity3Note,
    ]);
    expect(await listNotes(logins.accountTeamMember)).toEqual([
      recordIds.unwalledNote,
    ]);
    expect(await listNotes(logins.partner)).toEqual(
      [
        recordIds.opportunity1Note,
        recordIds.opportunity2Note,
        recordIds.opportunity3Note,
        recordIds.unwalledNote,
      ].sort(),
    );
    expect(await listNotes(logins.clientHead)).toEqual(
      expect.arrayContaining(
        [
          recordIds.opportunity1Note,
          recordIds.opportunity2Note,
          recordIds.opportunity3Note,
          recordIds.walledTwoNote,
          recordIds.unwalledNote,
        ].sort(),
      ),
    );
  });

  it('should grant a new account team member without recomputing opportunities', async () => {
    // Same wall clearance as the client head, so the account team groups it needs already exist
    await queryTestDatabase({
      sql: `UPDATE ${SCHEMA}."workspaceMember" SET "clearedWalls" = ARRAY['WALL_TWO']::${SCHEMA}."workspaceMember_clearedWalls_enum"[] WHERE "id" = $1`,
      parameters: [logins.opportunityTeamMember.workspaceMemberId],
    });
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(workspaceId, ['flatWorkspaceMemberMaps']);
    await syncAndRecompute();

    const opportunityAccessGroupIdsBefore =
      await findCompactAccessGroupIds('opportunity');
    const fullRecomputeStepsBefore = await countFullRecomputeSteps();

    await createAccessTestRecord({
      objectName: ACCOUNT_TEAM_MEMBER,
      data: {
        accountId: recordIds.accountX,
        memberId: logins.opportunityTeamMember.workspaceMemberId,
      },
    });
    await syncAndRecompute();

    expect(await countFullRecomputeSteps()).toBe(fullRecomputeStepsBefore);
    expect(await findCompactAccessGroupIds('opportunity')).toEqual(
      opportunityAccessGroupIdsBefore,
    );
    expect(
      await findOpportunityAccess({
        login: logins.opportunityTeamMember,
        opportunityIds: [recordIds.opportunity1, recordIds.opportunity2],
      }),
    ).toEqual({
      [recordIds.opportunity1]: 'Edit',
      [recordIds.opportunity2]: 'Edit',
    });
  });

  it('should add the group of an account getting its first team member to its opportunities only', async () => {
    const accountZ = await createAccessTestRecord({
      objectName: 'company',
      data: { name: 'Account Z' },
    });
    const opportunityOfZ = await createAccessTestRecord({
      objectName: 'opportunity',
      data: {
        name: 'Opportunity of Z',
        companyId: accountZ,
      },
    });
    const noteOfZ = await createAccessTestRecord({
      objectName: 'note',
      data: { title: 'Note of Z' },
    });

    await createAccessTestRecord({
      objectName: 'noteTarget',
      data: {
        noteId: noteOfZ,
        targetOpportunityId: opportunityOfZ,
      },
    });
    await syncAndRecompute();

    const fullRecomputeStepsBefore = await countFullRecomputeSteps();
    const otherOpportunitiesBefore = (
      await findCompactAccessGroupIds('opportunity')
    ).filter(({ id }) => id !== opportunityOfZ);

    await createAccessTestRecord({
      objectName: ACCOUNT_TEAM_MEMBER,
      data: {
        accountId: accountZ,
        memberId: logins.partner.workspaceMemberId,
      },
    });
    await syncAndRecompute();

    expect(await countFullRecomputeSteps()).toBe(fullRecomputeStepsBefore);
    expect(
      (await findCompactAccessGroupIds('opportunity')).filter(
        ({ id }) => id !== opportunityOfZ,
      ),
    ).toEqual(otherOpportunitiesBefore);
    expect(
      await findOpportunityAccess({
        login: logins.partner,
        opportunityIds: [opportunityOfZ],
      }),
    ).toEqual({ [opportunityOfZ]: 'Edit' });
    expect(
      await listRecordIdsWithGraphql({
        login: logins.partner,
        objectName: 'note',
        ids: [noteOfZ],
      }),
    ).toEqual([noteOfZ]);
  });

  it('should store the same groups as a full recompute after incremental changes', async () => {
    const before = {
      opportunity: await findCompactAccessGroupIds('opportunity'),
      note: await findCompactAccessGroupIds('note'),
    };

    await recomputeAll();

    expect(await findCompactAccessGroupIds('opportunity')).toEqual(
      before.opportunity,
    );
    expect(await findCompactAccessGroupIds('note')).toEqual(before.note);
  });
});
