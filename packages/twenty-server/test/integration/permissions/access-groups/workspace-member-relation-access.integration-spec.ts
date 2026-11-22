/* @license Enterprise */
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { findAccessGroupPropagationProgress } from 'test/integration/metadata/suites/role/utils/find-access-group-propagation-progress.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { describePermissionTestWorkspace } from 'test/integration/permissions/utils/describe-permission-test-workspace.util';
import { type PermissionTestRecordName } from 'test/integration/permissions/utils/permission-test-workspace.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type RowLevelPermissionRuleInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-rules.input';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { findAccessGroupValueLookups } from 'src/engine/permissions/internal/access-group/value-lookup/utils/find-access-group-value-lookups.util';
import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';

const TEAM_OBJECT_NAME = 'accessRecordTeamMember';
const VISIBILITY_TIER_RECORDS: PermissionTestRecordName[] = [
  'lowVisibilityTier',
  'mediumVisibilityTier',
  'fullVisibilityTier',
];

describePermissionTestWorkspace({
  name: 'access through a relation of the workspace member',
  defineTests: ({ findWorkspace }) => {
    let teamMemberId: string;
    let otherTeamMemberId: string;
    let recordTeamMemberId: string;
    const companyIds: Record<string, string> = {};

    const createRecord = async ({
      objectName,
      data,
    }: {
      objectName: string;
      data: object;
    }): Promise<string> => {
      const response = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: objectName,
          gqlFields: 'id',
          data,
        }),
        findWorkspace().adminAccessToken,
      );

      expect(response.body.errors).toBeUndefined();

      return Object.values<{ id: string }>(response.body.data)[0].id;
    };

    const joinCompanyTeam = ({
      workspaceMemberId,
      record,
    }: {
      workspaceMemberId: string;
      record: PermissionTestRecordName;
    }) =>
      createRecord({
        objectName: TEAM_OBJECT_NAME,
        data: { companyId: companyIds[record], memberId: workspaceMemberId },
      });

    const joinRecordTeam = ({
      workspaceMemberId,
      record,
    }: {
      workspaceMemberId: string;
      record: PermissionTestRecordName;
    }) =>
      createRecord({
        objectName: TEAM_OBJECT_NAME,
        data: {
          accessRecordId: findWorkspace().recordIds[record],
          memberId: workspaceMemberId,
        },
      });

    const syncAccessGroups = async () => {
      await waitForAllJobsToFinish();
      await getAppProviderByClassName<AccessGroupSyncService>(
        'AccessGroupSyncService',
      ).syncAccessGroups({ workspaceId: findWorkspace().workspaceId });
    };

    const runPendingComputes = () =>
      getAppProviderByClassName<DeferredWorkspaceOperationRunnerService>(
        'DeferredWorkspaceOperationRunnerService',
      ).runPendingOperations(findWorkspace().workspaceId);

    const findReadableVisibilityTierRecords = async (
      workspaceMemberId: string,
    ): Promise<PermissionTestRecordName[]> => {
      const workspace = findWorkspace();
      const principals =
        await getAppProviderByClassName<PrincipalPermissionsReadService>(
          'PrincipalPermissionsReadService',
        ).resolvePermissionsPrincipals({
          authContext: await resolveWorkspaceMemberAuthContext({
            workspaceId: workspace.workspaceId,
            workspaceMemberId,
          }),
        });
      const recordPermissionsReadService =
        getAppProviderByClassName<RecordPermissionsReadService>(
          'RecordPermissionsReadService',
        );
      const readableRecords: PermissionTestRecordName[] = [];

      for (const record of VISIBILITY_TIER_RECORDS) {
        if (
          await recordPermissionsReadService.canAccessRecords({
            principals,
            objectMetadataId: workspace.objectMetadataId,
            recordIds: [workspace.recordIds[record]],
            operationType: 'read',
          })
        ) {
          readableRecords.push(record);
        }
      }

      return readableRecords;
    };

    const createRoleWithRule = async ({
      label,
      rule,
    }: {
      label: string;
      rule: RowLevelPermissionRuleInput;
    }): Promise<string> => {
      const workspace = findWorkspace();
      const { data } = await createOneRole({
        input: {
          label,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
        },
        gqlFields: 'id',
        expectToFail: false,
        token: workspace.adminAccessToken,
      });
      const roleId: string = data.createOneRole.id;

      await revokeObjectRecordsPermissions({
        roleId,
        objectMetadataId: workspace.objectMetadataId,
        token: workspace.adminAccessToken,
      });
      await upsertRowLevelPermissionRules({
        input: {
          roleId,
          objectMetadataId: workspace.objectMetadataId,
          rules: [rule],
        },
        expectToFail: false,
        token: workspace.adminAccessToken,
      });

      return roleId;
    };

    beforeAll(async () => {
      const workspace = findWorkspace();
      const token = workspace.adminAccessToken;

      for (const featureFlag of [
        FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
        FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
      ]) {
        await updateFeatureFlag({
          featureFlag,
          value: true,
          workspaceId: workspace.workspaceId,
          expectToFail: false,
        });
      }

      const { objects } = await findManyObjectMetadata<{
        id: string;
        nameSingular: string;
        fieldsList: { id: string; name: string }[];
      }>({
        input: { filter: {}, paging: { first: 1000 } },
        gqlFields: 'id nameSingular fieldsList { id name }',
        expectToFail: false,
        token,
      });
      const workspaceMemberObjectMetadata = objects.find(
        ({ nameSingular }) => nameSingular === 'workspaceMember',
      );
      const findFieldMetadataId = ({
        objectNameSingular,
        fieldName,
      }: {
        objectNameSingular: string;
        fieldName: string;
      }): string => {
        const fieldMetadataId = objects
          .find(({ nameSingular }) => nameSingular === objectNameSingular)
          ?.fieldsList.find(({ name }) => name === fieldName)?.id;

        if (!isDefined(fieldMetadataId)) {
          throw new Error(`${objectNameSingular}.${fieldName} not found`);
        }

        return fieldMetadataId;
      };

      if (!isDefined(workspaceMemberObjectMetadata)) {
        throw new Error('workspaceMember object metadata not found');
      }

      const { data: teamObjectData } = await createOneObjectMetadata({
        input: {
          nameSingular: TEAM_OBJECT_NAME,
          namePlural: `${TEAM_OBJECT_NAME}s`,
          labelSingular: TEAM_OBJECT_NAME,
          labelPlural: `${TEAM_OBJECT_NAME}s`,
          icon: 'IconUsers',
        },
        gqlFields: 'id',
        expectToFail: false,
        token,
      });
      const companyObjectMetadataId = objects.find(
        ({ nameSingular }) => nameSingular === 'company',
      )?.id;

      if (!isDefined(companyObjectMetadataId)) {
        throw new Error('company object metadata not found');
      }

      const [
        recordCompanyField,
        teamRecordField,
        teamCompanyField,
        teamMemberField,
      ] = await Promise.all(
        [
          {
            objectMetadataId: workspace.objectMetadataId,
            name: 'company',
            targetObjectMetadataId: companyObjectMetadataId,
            targetFieldLabel: 'Access records',
          },
          {
            objectMetadataId: teamObjectData.createOneObject.id,
            name: 'accessRecord',
            targetObjectMetadataId: workspace.objectMetadataId,
            targetFieldLabel: 'Team',
          },
          {
            objectMetadataId: teamObjectData.createOneObject.id,
            name: 'company',
            targetObjectMetadataId: companyObjectMetadataId,
            targetFieldLabel: 'Access record team',
          },
          {
            objectMetadataId: teamObjectData.createOneObject.id,
            name: 'member',
            targetObjectMetadataId: workspaceMemberObjectMetadata.id,
            targetFieldLabel: 'Access record teams',
          },
        ].map(
          ({
            objectMetadataId,
            name,
            targetObjectMetadataId,
            targetFieldLabel,
          }) =>
            createRelationBetweenObjects({
              objectMetadataId,
              targetObjectMetadataId,
              type: FieldMetadataType.RELATION,
              relationType: RelationType.MANY_TO_ONE,
              name,
              label: name,
              targetFieldLabel,
              targetFieldIcon: 'IconUsers',
              token,
            }),
        ),
      );
      const { data: clearedVisibilityTiersData } = await createOneFieldMetadata(
        {
          input: {
            objectMetadataId: workspaceMemberObjectMetadata.id,
            name: 'clearedVisibilityTiers',
            label: 'clearedVisibilityTiers',
            type: FieldMetadataType.MULTI_SELECT,
            isNullable: true,
            options: ['LOW', 'MEDIUM', 'FULL'].map((value, position) => ({
              label: value,
              value,
              color: 'blue',
              position,
            })),
          },
          gqlFields: 'id',
          expectToFail: false,
          token,
        },
      );

      const teamRoleId = await createRoleWithRule({
        label: 'Company team behind visibility tiers',
        rule: {
          canReadRecords: true,
          predicates: [
            {
              id: v4(),
              fieldMetadataId: recordCompanyField.id,
              operand: RowLevelPermissionPredicateOperand.IS,
              workspaceMemberRelationFieldMetadataId:
                teamMemberField.relation.targetFieldMetadata.id,
              workspaceMemberFieldMetadataId: teamCompanyField.id,
            },
          ],
          predicateGroups: [
            {
              id: v4(),
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.OR,
              predicates: [
                {
                  id: v4(),
                  fieldMetadataId: workspace.visibilityTierFieldMetadataId,
                  operand: RowLevelPermissionPredicateOperand.IS_EMPTY,
                },
                {
                  id: v4(),
                  fieldMetadataId: workspace.visibilityTierFieldMetadataId,
                  operand: RowLevelPermissionPredicateOperand.IS,
                  workspaceMemberFieldMetadataId:
                    clearedVisibilityTiersData.createOneField.id,
                },
              ],
            },
          ],
        },
      });
      const recordTeamRoleId = await createRoleWithRule({
        label: 'Record team',
        rule: {
          canReadRecords: true,
          predicates: [
            {
              id: v4(),
              relationFieldMetadataId:
                teamRecordField.relation.targetFieldMetadata.id,
              fieldMetadataId: teamMemberField.id,
              operand: RowLevelPermissionPredicateOperand.IS,
              workspaceMemberFieldMetadataId: findFieldMetadataId({
                objectNameSingular: 'workspaceMember',
                fieldName: 'id',
              }),
            },
          ],
        },
      });

      teamMemberId = workspace.workspaceMemberIds.none;
      otherTeamMemberId = workspace.workspaceMemberIds.rowLevel;
      recordTeamMemberId = workspace.workspaceMemberIds.allRecords;

      for (const [workspaceMemberId, roleId] of [
        [teamMemberId, teamRoleId],
        [otherTeamMemberId, teamRoleId],
        [recordTeamMemberId, recordTeamRoleId],
      ]) {
        await updateWorkspaceMemberRole({
          input: { workspaceMemberId, roleId },
          expectToFail: false,
          token,
        });
        await makeGraphqlApiRequest(
          updateOneOperationFactory({
            objectMetadataSingularName: 'workspaceMember',
            gqlFields: 'id',
            recordId: workspaceMemberId,
            data: { clearedVisibilityTiers: ['LOW', 'MEDIUM'] },
          }),
          token,
        );
      }

      for (const record of VISIBILITY_TIER_RECORDS) {
        companyIds[record] = await createRecord({
          objectName: 'company',
          data: { name: record },
        });

        const response = await makeGraphqlApiRequest(
          updateOneOperationFactory({
            objectMetadataSingularName: workspace.objectNameSingular,
            gqlFields: 'id',
            recordId: workspace.recordIds[record],
            data: { companyId: companyIds[record] },
          }),
          token,
        );

        expect(response.body.errors).toBeUndefined();
      }

      for (const record of [
        'lowVisibilityTier',
        'fullVisibilityTier',
      ] satisfies PermissionTestRecordName[]) {
        await joinCompanyTeam({ workspaceMemberId: teamMemberId, record });
      }

      await syncAccessGroups();
      await runPendingComputes();
      await getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
      ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
        workspaceId: workspace.workspaceId,
        objectMetadataId: workspace.objectMetadataId,
      });
    });

    it('should look up both rules by value', async () => {
      const workspace = findWorkspace();
      const metadataMaps =
        await getAppProviderByClassName<RecordAccessGroupMetadataMapsService>(
          'RecordAccessGroupMetadataMapsService',
        ).findAfterEvictingLocalCache(workspace.workspaceId);

      expect(
        findAccessGroupValueLookups({
          flatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: workspace.objectMetadataId,
            flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
          }),
          metadataMaps,
        })
          .map(({ keys, residualMemberFieldKeys }) => ({
            keyColumns: keys.map(
              ({ columnName, relationHop }) =>
                `${relationHop?.targetFlatObjectMetadata.nameSingular ?? workspace.objectNameSingular}.${columnName}`,
            ),
            residualMemberFieldCount: residualMemberFieldKeys.length,
          }))
          .sort((first, second) =>
            first.keyColumns[0].localeCompare(second.keyColumns[0]),
          ),
      ).toEqual([
        {
          keyColumns: [`${workspace.objectNameSingular}.companyId`],
          residualMemberFieldCount: 1,
        },
        {
          keyColumns: [`${TEAM_OBJECT_NAME}.memberId`],
          residualMemberFieldCount: 0,
        },
      ]);
    });

    it('should let a company team member read the records of their companies, except tiers they are not cleared for', async () => {
      expect(await findReadableVisibilityTierRecords(teamMemberId)).toEqual([
        'lowVisibilityTier',
      ]);
      expect(
        await findReadableVisibilityTierRecords(otherTeamMemberId),
      ).toEqual([]);
    });

    it('should let a member joining an existing team read its record without planning any compute', async () => {
      await joinCompanyTeam({
        workspaceMemberId: otherTeamMemberId,
        record: 'lowVisibilityTier',
      });
      await syncAccessGroups();

      const { data } = await findAccessGroupPropagationProgress({
        expectToFail: false,
        token: findWorkspace().adminAccessToken,
      });

      expect(data.accessGroupPropagationProgress.isInProgress).toBe(false);
      expect(
        await findReadableVisibilityTierRecords(otherTeamMemberId),
      ).toEqual(['lowVisibilityTier']);
    });

    it('should let the first member of a team read its record once the sync applies its groups', async () => {
      await joinCompanyTeam({
        workspaceMemberId: teamMemberId,
        record: 'mediumVisibilityTier',
      });
      await syncAccessGroups();
      await runPendingComputes();

      expect(await findReadableVisibilityTierRecords(teamMemberId)).toEqual([
        'lowVisibilityTier',
        'mediumVisibilityTier',
      ]);
    });

    it('should let a member read a record through the one-to-many team relation', async () => {
      await joinRecordTeam({
        workspaceMemberId: recordTeamMemberId,
        record: 'fullVisibilityTier',
      });
      await syncAccessGroups();
      await runPendingComputes();

      expect(
        await findReadableVisibilityTierRecords(recordTeamMemberId),
      ).toEqual(['fullVisibilityTier']);
    });
  },
});
