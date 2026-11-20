/* @license Enterprise */
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { findAccessGroupFamilies } from 'src/engine/permissions/internal/access-group/utils/find-access-group-families.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const SCHEMA = `"${getWorkspaceSchemaName(workspaceId)}"`;
const ACCOUNT_TEAM_MEMBER = 'accountTeamMember';
const OPPORTUNITY_TEAM_MEMBER = 'opportunityTeamMember';
const FEATURE_FLAGS = [
  FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
  FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
  FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
];

type Login = { workspaceMemberId: string; userId: string; token: string };

describe('Account team access (integration)', () => {
  const metadataIds: Record<string, string> = {};
  const recordIds: Record<string, string> = {};
  let logins: Record<
    'clientHead' | 'opportunityTeamMember' | 'partner' | 'accountTeamMember',
    Login
  >;
  let roleId: string;

  const query = async <TRow>(
    sql: string,
    parameters: unknown[] = [],
  ): Promise<TRow[]> => {
    const rows: TRow[] = await global.testDataSource.query(sql, parameters);

    return rows;
  };

  const findObjectMetadataId = async (nameSingular: string) => {
    const [{ id }] = await query<{ id: string }>(
      `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = $2`,
      [workspaceId, nameSingular],
    );

    return id;
  };

  const findFieldMetadataId = async (
    objectMetadataId: string,
    name: string,
  ) => {
    const [{ id }] = await query<{ id: string }>(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = $2`,
      [objectMetadataId, name],
    );

    return id;
  };

  const findInverseFieldMetadataId = async (fieldMetadataId: string) => {
    const [{ relationTargetFieldMetadataId }] = await query<{
      relationTargetFieldMetadataId: string;
    }>(
      `SELECT "relationTargetFieldMetadataId" FROM core."fieldMetadata" WHERE "id" = $1`,
      [fieldMetadataId],
    );

    return relationTargetFieldMetadataId;
  };

  const createObject = async (nameSingular: string): Promise<string> => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular,
        namePlural: `${nameSingular}s`,
        labelSingular: nameSingular,
        labelPlural: `${nameSingular}s`,
        icon: 'IconUsers',
        isLabelSyncedWithName: false,
      },
    });

    return data.createOneObject.id;
  };

  const createManyToOne = async ({
    objectMetadataId,
    targetObjectMetadataId,
    name,
    targetFieldLabel,
  }: {
    objectMetadataId: string;
    targetObjectMetadataId: string;
    name: string;
    targetFieldLabel: string;
  }) => {
    const createdField = await createRelationBetweenObjects({
      objectMetadataId,
      targetObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name,
      label: name,
      targetFieldLabel,
      targetFieldIcon: 'IconUsers',
    });

    return createdField.id;
  };

  const createSelect = async ({
    objectMetadataId,
    name,
    values,
    type = FieldMetadataType.SELECT,
  }: {
    objectMetadataId: string;
    name: string;
    values: string[];
    type?: FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT;
  }): Promise<string> => {
    const { data } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        name,
        label: name,
        type,
        isNullable: true,
        options: values.map((value, position) => ({
          label: value,
          value,
          color: 'blue',
          position,
        })),
      },
      gqlFields: 'id',
    });

    return data.createOneField.id;
  };

  const createRecord = async (objectName: string, data: object) => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: objectName,
        gqlFields: 'id',
        data,
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return Object.values<{ id: string }>(response.body.data)[0].id;
  };

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
    ).syncAccessGroups(workspaceId);
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
        objectMetadataId: await findObjectMetadataId(objectName),
      });
    }
  };

  const listIdsWithGraphql = async ({
    login,
    objectName,
    ids,
  }: {
    login: Login;
    objectName: 'opportunity' | 'note';
    ids: string[];
  }): Promise<string[]> => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: objectName,
        objectMetadataPluralName: `${objectName === 'opportunity' ? 'opportunities' : 'notes'}`,
        gqlFields: 'id',
        filter: { id: { in: ids } },
      }),
      login.token,
    );

    expect(response.body.errors).toBeUndefined();

    return Object.values<{ edges: { node: { id: string } }[] }>(
      response.body.data,
    )[0]
      .edges.map(({ node }) => node.id)
      .sort();
  };

  const listOpportunityIdsWithRest = async ({
    login,
    ids,
  }: {
    login: Login;
    ids: string[];
  }): Promise<string[]> => {
    const response = await makeRestApiRequest({
      method: 'get',
      path: `/opportunities?filter=id[in]:[${ids.map((id) => `"${id}"`).join(',')}]`,
      bearer: login.token,
    });

    expect(response.body.error).toBeUndefined();

    return response.body.data.opportunities
      .map(({ id }: { id: string }) => id)
      .sort();
  };

  const canEditOpportunity = async ({
    login,
    opportunityId,
  }: {
    login: Login;
    opportunityId: string;
  }): Promise<boolean> => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id',
        recordId: opportunityId,
        data: { name: `Edited ${v4()}` },
      }),
      login.token,
    );

    return response.body.errors === undefined;
  };

  const findAccess = async ({
    login,
    opportunityIds,
  }: {
    login: Login;
    opportunityIds: string[];
  }): Promise<Record<string, 'Edit' | 'Read' | 'None'>> => {
    const readableIds = await listIdsWithGraphql({
      login,
      objectName: 'opportunity',
      ids: opportunityIds,
    });

    expect(
      await listOpportunityIdsWithRest({ login, ids: opportunityIds }),
    ).toEqual(readableIds);

    const access: Record<string, 'Edit' | 'Read' | 'None'> = {};

    for (const opportunityId of opportunityIds) {
      access[opportunityId] = !readableIds.includes(opportunityId)
        ? 'None'
        : (await canEditOpportunity({ login, opportunityId }))
          ? 'Edit'
          : 'Read';
    }

    return access;
  };

  const findCompactAccessGroupIds = async (objectName: string) =>
    query<{ id: string; accessGroupIds: number[] }>(
      `SELECT "id", "_accessGroupIds" AS "accessGroupIds" FROM ${SCHEMA}."${objectName}" ORDER BY "id"`,
    );

  const countPlannedComputes = async () => {
    const [{ count }] = await query<{ count: string }>(
      `SELECT count(*) FROM core."deferredWorkspaceOperation" WHERE "workspaceId" = $1 AND "name" = 'compute_recordAccessGroupIds'`,
      [workspaceId],
    );

    return Number(count);
  };

  const createLogins = async () => {
    // Seeded users beyond the named ones have no workspace member yet
    const workspaceMembers = await query<{ id: string; userId: string }>(
      `INSERT INTO ${SCHEMA}."workspaceMember" ("userId", "userEmail", "nameFirstName", "nameLastName")
        SELECT "user"."id", "user"."email", 'Deal', "user"."email"
        FROM core."userWorkspace"
        JOIN core."user" ON "user"."id" = "userWorkspace"."userId"
        WHERE "userWorkspace"."workspaceId" = $1
          AND "userWorkspace"."deletedAt" IS NULL
          AND NOT EXISTS (SELECT 1 FROM ${SCHEMA}."workspaceMember" WHERE "workspaceMember"."userId" = "user"."id")
        ORDER BY "user"."id"
        LIMIT 4
        RETURNING "id", "userId"`,
      [workspaceId],
    );

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(workspaceId, ['flatWorkspaceMemberMaps']);

    const accessTokenService = getAppProviderByClassName<{
      generateAccessToken: (args: {
        userId: string;
        workspaceId: string;
        authProvider: AuthProviderEnum;
      }) => Promise<{ token: string }>;
    }>('AccessTokenService');

    const createLogin = async ({
      id: workspaceMemberId,
      userId,
    }: {
      id: string;
      userId: string;
    }): Promise<Login> => {
      const { token } = await accessTokenService.generateAccessToken({
        userId,
        workspaceId,
        authProvider: AuthProviderEnum.Password,
      });

      return { workspaceMemberId, userId, token };
    };

    logins = {
      clientHead: await createLogin(workspaceMembers[0]),
      opportunityTeamMember: await createLogin(workspaceMembers[1]),
      partner: await createLogin(workspaceMembers[2]),
      accountTeamMember: await createLogin(workspaceMembers[3]),
    };
  };

  beforeAll(async () => {
    for (const featureFlag of FEATURE_FLAGS) {
      await updateFeatureFlag({
        expectToFail: false,
        featureFlag,
        value: true,
      });
    }

    metadataIds.opportunity = await findObjectMetadataId('opportunity');
    metadataIds.company = await findObjectMetadataId('company');
    metadataIds.workspaceMember = await findObjectMetadataId('workspaceMember');
    metadataIds.accountTeamMember = await createObject(ACCOUNT_TEAM_MEMBER);
    metadataIds.opportunityTeamMember = await createObject(
      OPPORTUNITY_TEAM_MEMBER,
    );

    metadataIds.accountTeamMemberAccount = await createManyToOne({
      objectMetadataId: metadataIds.accountTeamMember,
      targetObjectMetadataId: metadataIds.company,
      name: 'account',
      targetFieldLabel: 'Account team',
    });
    metadataIds.accountTeamMemberMember = await createManyToOne({
      objectMetadataId: metadataIds.accountTeamMember,
      targetObjectMetadataId: metadataIds.workspaceMember,
      name: 'member',
      targetFieldLabel: 'Account teams',
    });
    metadataIds.workspaceMemberAccountTeams = await findInverseFieldMetadataId(
      metadataIds.accountTeamMemberMember,
    );
    metadataIds.accountTeamMemberTeamRole = await createSelect({
      objectMetadataId: metadataIds.accountTeamMember,
      name: 'teamRole',
      values: ['MEMBER', 'CLIENT_HEAD'],
    });
    metadataIds.opportunityTeamMemberOpportunity = await createManyToOne({
      objectMetadataId: metadataIds.opportunityTeamMember,
      targetObjectMetadataId: metadataIds.opportunity,
      name: 'opportunity',
      targetFieldLabel: 'Opportunity team',
    });
    metadataIds.opportunityOpportunityTeam = await findInverseFieldMetadataId(
      metadataIds.opportunityTeamMemberOpportunity,
    );
    metadataIds.opportunityTeamMemberMember = await createManyToOne({
      objectMetadataId: metadataIds.opportunityTeamMember,
      targetObjectMetadataId: metadataIds.workspaceMember,
      name: 'member',
      targetFieldLabel: 'Opportunity teams',
    });
    metadataIds.opportunityPractice = await createSelect({
      objectMetadataId: metadataIds.opportunity,
      name: 'practice',
      values: ['ADVISORY', 'AUDIT'],
    });
    metadataIds.opportunityWall = await createSelect({
      objectMetadataId: metadataIds.opportunity,
      name: 'wall',
      values: ['WALL_ONE', 'WALL_TWO'],
    });
    metadataIds.workspaceMemberPractice = await createSelect({
      objectMetadataId: metadataIds.workspaceMember,
      name: 'practice',
      values: ['ADVISORY', 'AUDIT'],
    });
    metadataIds.workspaceMemberClearedWalls = await createSelect({
      objectMetadataId: metadataIds.workspaceMember,
      name: 'clearedWalls',
      values: ['WALL_ONE', 'WALL_TWO'],
      type: FieldMetadataType.MULTI_SELECT,
    });
    metadataIds.opportunityCompany = await findFieldMetadataId(
      metadataIds.opportunity,
      'company',
    );
    metadataIds.workspaceMemberId = await findFieldMetadataId(
      metadataIds.workspaceMember,
      'id',
    );

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
      objectMetadataId: await findObjectMetadataId('note'),
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
                ...accountTeamPredicate,
                workspaceMemberRelationFilterFieldMetadataId:
                  metadataIds.accountTeamMemberTeamRole,
                workspaceMemberRelationFilterValue: ['CLIENT_HEAD'],
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

    const [{ id: storedClientHeadRuleId }] = await query<{ id: string }>(
      `SELECT "rowLevelPermissionRuleId" AS "id" FROM core."rowLevelPermissionPredicate"
        WHERE "roleId" = $1 AND "workspaceMemberRelationFilterFieldMetadataId" IS NOT NULL`,
      [roleId],
    );

    // Name only: every other opportunity field is unreadable through the client head rule
    await query(
      `INSERT INTO core."fieldPermission" ("roleId", "objectMetadataId", "fieldMetadataId", "canReadFieldValue", "canUpdateFieldValue", "workspaceId", "universalIdentifier", "applicationId", "rowLevelPermissionRuleId")
        SELECT $1, "fieldMetadata"."objectMetadataId", "fieldMetadata"."id", FALSE, FALSE, $2, uuid_generate_v4(), "role"."applicationId", $3
        FROM core."fieldMetadata", core."role"
        WHERE "fieldMetadata"."objectMetadataId" = $4 AND "role"."id" = $1
          AND "fieldMetadata"."name" NOT IN ('id', 'name') AND "fieldMetadata"."isSystem" = FALSE`,
      [roleId, workspaceId, storedClientHeadRuleId, metadataIds.opportunity],
    );

    await createLogins();

    for (const login of Object.values(logins)) {
      await updateWorkspaceMemberRole({
        expectToFail: false,
        input: { workspaceMemberId: login.workspaceMemberId, roleId },
      });
    }

    await query(
      `UPDATE ${SCHEMA}."workspaceMember" SET "practice" = 'ADVISORY' WHERE "id" = $1`,
      [logins.partner.workspaceMemberId],
    );
    await query(
      `UPDATE ${SCHEMA}."workspaceMember" SET "clearedWalls" = ARRAY['WALL_TWO']::${SCHEMA}."workspaceMember_clearedWalls_enum"[] WHERE "id" = $1`,
      [logins.clientHead.workspaceMemberId],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(workspaceId, ['flatWorkspaceMemberMaps']);

    recordIds.accountX = await createRecord('company', { name: 'Account X' });
    recordIds.accountY = await createRecord('company', { name: 'Account Y' });

    for (const [name, data] of [
      ['opportunity1', { companyId: recordIds.accountX }],
      ['opportunity2', { companyId: recordIds.accountX }],
      ['opportunity3', { companyId: recordIds.accountX }],
      ['walledOne', { companyId: recordIds.accountY, wall: 'WALL_ONE' }],
      ['walledTwo', { companyId: recordIds.accountY, wall: 'WALL_TWO' }],
      ['unwalled', { companyId: recordIds.accountY }],
    ] as const) {
      recordIds[name] = await createRecord('opportunity', {
        name,
        practice: 'ADVISORY',
        ...data,
      });
      recordIds[`${name}Note`] = await createRecord('note', {
        title: `Note of ${name}`,
      });
      await createRecord('noteTarget', {
        noteId: recordIds[`${name}Note`],
        targetOpportunityId: recordIds[name],
      });
    }

    for (const [workspaceMemberId, accountId, teamRole] of [
      [logins.clientHead.workspaceMemberId, recordIds.accountX, 'CLIENT_HEAD'],
      [logins.clientHead.workspaceMemberId, recordIds.accountY, 'CLIENT_HEAD'],
      [
        logins.accountTeamMember.workspaceMemberId,
        recordIds.accountY,
        'MEMBER',
      ],
    ]) {
      await createRecord(ACCOUNT_TEAM_MEMBER, {
        accountId,
        memberId: workspaceMemberId,
        teamRole,
      });
    }

    await createRecord(OPPORTUNITY_TEAM_MEMBER, {
      opportunityId: recordIds.opportunity3,
      memberId: logins.opportunityTeamMember.workspaceMemberId,
    });

    await syncAndRecompute();
    await recomputeAll();
  }, 300_000);

  it('should look up the member bound rules as families', async () => {
    const metadataMaps =
      await getAppProviderByClassName<RecordAccessGroupMetadataMapsService>(
        'RecordAccessGroupMetadataMapsService',
      ).findAfterEvictingLocalCache(workspaceId);
    const families = findAccessGroupFamilies({
      flatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: metadataIds.opportunity,
        flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
      }),
      metadataMaps,
    }).filter((family) => family.roleId === roleId);

    expect(
      families
        .map(({ keys }) =>
          keys
            .map(
              ({ columnName, relationHop }) =>
                `${relationHop?.targetFlatObjectMetadata.nameSingular ?? 'opportunity'}.${columnName}`,
            )
            .join(','),
        )
        .sort(),
    ).toEqual([
      'opportunity.companyId',
      'opportunity.companyId',
      'opportunity.practice',
      `${OPPORTUNITY_TEAM_MEMBER}.memberId`,
    ]);
  });

  it('should give each login the expected access to the opportunities of an account', async () => {
    const opportunityIds = [
      recordIds.opportunity1,
      recordIds.opportunity2,
      recordIds.opportunity3,
    ];

    expect(
      await findAccess({ login: logins.clientHead, opportunityIds }),
    ).toEqual({
      [recordIds.opportunity1]: 'Edit',
      [recordIds.opportunity2]: 'Edit',
      [recordIds.opportunity3]: 'Edit',
    });
    expect(
      await findAccess({ login: logins.opportunityTeamMember, opportunityIds }),
    ).toEqual({
      [recordIds.opportunity1]: 'None',
      [recordIds.opportunity2]: 'None',
      [recordIds.opportunity3]: 'Edit',
    });
    expect(await findAccess({ login: logins.partner, opportunityIds })).toEqual(
      {
        [recordIds.opportunity1]: 'Read',
        [recordIds.opportunity2]: 'Read',
        [recordIds.opportunity3]: 'Read',
      },
    );
  });

  it('should keep walled opportunities from logins not cleared for their wall', async () => {
    const opportunityIds = [
      recordIds.walledOne,
      recordIds.walledTwo,
      recordIds.unwalled,
    ];

    expect(
      await listIdsWithGraphql({
        login: logins.clientHead,
        objectName: 'opportunity',
        ids: opportunityIds,
      }),
    ).toEqual([...opportunityIds].sort());
    expect(
      await listIdsWithGraphql({
        login: logins.accountTeamMember,
        objectName: 'opportunity',
        ids: opportunityIds,
      }),
    ).toEqual([recordIds.unwalled]);
    expect(
      await listIdsWithGraphql({
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
    const listNotes = (login: Login) =>
      listIdsWithGraphql({ login, objectName: 'note', ids: noteIds });

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
    await query(
      `UPDATE ${SCHEMA}."workspaceMember" SET "clearedWalls" = ARRAY['WALL_TWO']::${SCHEMA}."workspaceMember_clearedWalls_enum"[] WHERE "id" = $1`,
      [logins.opportunityTeamMember.workspaceMemberId],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(workspaceId, ['flatWorkspaceMemberMaps']);
    await syncAndRecompute();

    const opportunityAccessGroupIdsBefore =
      await findCompactAccessGroupIds('opportunity');
    const plannedComputesBefore = await countPlannedComputes();

    await createRecord(ACCOUNT_TEAM_MEMBER, {
      accountId: recordIds.accountX,
      memberId: logins.opportunityTeamMember.workspaceMemberId,
      teamRole: 'MEMBER',
    });
    await syncAndRecompute();

    expect(await countPlannedComputes()).toBe(plannedComputesBefore);
    expect(await findCompactAccessGroupIds('opportunity')).toEqual(
      opportunityAccessGroupIdsBefore,
    );
    expect(
      await findAccess({
        login: logins.opportunityTeamMember,
        opportunityIds: [recordIds.opportunity1, recordIds.opportunity2],
      }),
    ).toEqual({
      [recordIds.opportunity1]: 'Edit',
      [recordIds.opportunity2]: 'Edit',
    });
  });

  it('should add the group of an account getting its first team member to its opportunities only', async () => {
    const accountZ = await createRecord('company', { name: 'Account Z' });
    const opportunityOfZ = await createRecord('opportunity', {
      name: 'Opportunity of Z',
      companyId: accountZ,
    });
    const noteOfZ = await createRecord('note', { title: 'Note of Z' });

    await createRecord('noteTarget', {
      noteId: noteOfZ,
      targetOpportunityId: opportunityOfZ,
    });
    await syncAndRecompute();

    const plannedComputesBefore = await countPlannedComputes();
    const otherOpportunitiesBefore = (
      await findCompactAccessGroupIds('opportunity')
    ).filter(({ id }) => id !== opportunityOfZ);

    await createRecord(ACCOUNT_TEAM_MEMBER, {
      accountId: accountZ,
      memberId: logins.partner.workspaceMemberId,
      teamRole: 'MEMBER',
    });
    await syncAndRecompute();

    expect(await countPlannedComputes()).toBe(plannedComputesBefore);
    expect(
      (await findCompactAccessGroupIds('opportunity')).filter(
        ({ id }) => id !== opportunityOfZ,
      ),
    ).toEqual(otherOpportunitiesBefore);
    expect(
      await findAccess({
        login: logins.partner,
        opportunityIds: [opportunityOfZ],
      }),
    ).toEqual({ [opportunityOfZ]: 'Edit' });
    expect(
      await listIdsWithGraphql({
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
