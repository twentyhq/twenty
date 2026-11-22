/* @license Enterprise */
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { findAccessGroupPropagationProgress } from 'test/integration/metadata/suites/role/utils/find-access-group-propagation-progress.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { addPermissionTestWorkspaceMember } from 'test/integration/permissions/utils/add-permission-test-workspace-member.util';
import { describePermissionTestWorkspace } from 'test/integration/permissions/utils/describe-permission-test-workspace.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { findAccessGroupValueLookups } from 'src/engine/permissions/internal/access-group/value-lookup/utils/find-access-group-value-lookups.util';
import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';

describePermissionTestWorkspace({
  name: 'account team access through a relation of the workspace member',
  defineTests: ({ findWorkspace }) => {
    const recordIds: Record<string, string> = {};
    let accountTeamMembersFieldMetadataId: string;
    let accessRecordAccountFieldMetadataId: string;
    let teamMemberId: string;
    let outsiderId: string;

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

    const createManyToOneField = async ({
      objectMetadataId,
      targetObjectMetadataId,
      name,
      targetFieldLabel,
    }: {
      objectMetadataId: string;
      targetObjectMetadataId: string;
      name: string;
      targetFieldLabel: string;
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
        token: findWorkspace().adminAccessToken,
      });

    const createAccessRecordOfAccount = (accountId: string) =>
      createRecord({
        objectName: findWorkspace().objectNameSingular,
        data: { accountId },
      });

    const joinAccountTeam = ({
      workspaceMemberId,
      accountId,
    }: {
      workspaceMemberId: string;
      accountId: string;
    }) =>
      createRecord({
        objectName: 'accountTeamMember',
        data: { accountId, memberId: workspaceMemberId },
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

    const findReadableRecordIds = async ({
      workspaceMemberId,
      candidateRecordIds,
    }: {
      workspaceMemberId: string;
      candidateRecordIds: string[];
    }): Promise<string[]> => {
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
      const readableRecordIds: string[] = [];

      for (const recordId of candidateRecordIds) {
        if (
          await recordPermissionsReadService.canAccessRecords({
            principals,
            objectMetadataId: workspace.objectMetadataId,
            recordIds: [recordId],
            operationType: 'read',
          })
        ) {
          readableRecordIds.push(recordId);
        }
      }

      return readableRecordIds;
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
      }>({
        input: { filter: {}, paging: { first: 1000 } },
        gqlFields: 'id nameSingular',
        expectToFail: false,
        token,
      });
      const workspaceMemberObjectMetadataId = objects.find(
        ({ nameSingular }) => nameSingular === 'workspaceMember',
      )?.id;

      expect(workspaceMemberObjectMetadataId).toBeDefined();

      const [accountObjectMetadataId, accountTeamMemberObjectMetadataId] =
        await Promise.all(
          ['account', 'accountTeamMember'].map(async (nameSingular) => {
            const { data } = await createOneObjectMetadata({
              input: {
                nameSingular,
                namePlural: `${nameSingular}s`,
                labelSingular: nameSingular,
                labelPlural: `${nameSingular}s`,
                icon: 'IconUsers',
              },
              gqlFields: 'id',
              expectToFail: false,
              token,
            });

            return data.createOneObject.id;
          }),
        );

      accessRecordAccountFieldMetadataId = (
        await createManyToOneField({
          objectMetadataId: workspace.objectMetadataId,
          targetObjectMetadataId: accountObjectMetadataId,
          name: 'account',
          targetFieldLabel: 'Access records',
        })
      ).id;

      const accountTeamMemberAccountField = await createManyToOneField({
        objectMetadataId: accountTeamMemberObjectMetadataId,
        targetObjectMetadataId: accountObjectMetadataId,
        name: 'account',
        targetFieldLabel: 'Account team',
      });
      const accountTeamMemberMemberField = await createManyToOneField({
        objectMetadataId: accountTeamMemberObjectMetadataId,
        targetObjectMetadataId: workspaceMemberObjectMetadataId as string,
        name: 'member',
        targetFieldLabel: 'Account teams',
      });

      accountTeamMembersFieldMetadataId =
        accountTeamMemberMemberField.relation.targetFieldMetadata.id;

      const { data } = await createOneRole({
        input: {
          label: 'Account team',
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
        },
        gqlFields: 'id',
        expectToFail: false,
        token,
      });
      const roleId: string = data.createOneRole.id;

      await revokeObjectRecordsPermissions({
        roleId,
        objectMetadataId: workspace.objectMetadataId,
        token,
      });
      await upsertRowLevelPermissionRules({
        input: {
          roleId,
          objectMetadataId: workspace.objectMetadataId,
          rules: [
            {
              canReadRecords: true,
              predicates: [
                {
                  id: v4(),
                  fieldMetadataId: accessRecordAccountFieldMetadataId,
                  operand: RowLevelPermissionPredicateOperand.IS,
                  workspaceMemberRelationFieldMetadataId:
                    accountTeamMembersFieldMetadataId,
                  workspaceMemberFieldMetadataId:
                    accountTeamMemberAccountField.id,
                },
              ],
            },
          ],
        },
        expectToFail: false,
        token,
      });

      [teamMemberId, outsiderId] = await Promise.all(
        [0, 1].map(() =>
          addPermissionTestWorkspaceMember({
            workspaceId: workspace.workspaceId,
            workspaceOrigin: workspace.workspaceOrigin,
            inviteHash: workspace.inviteHash,
            roleId,
            adminAccessToken: token,
          }),
        ),
      );

      recordIds.accountX = await createRecord({
        objectName: 'account',
        data: { name: 'Account X' },
      });
      recordIds.accountY = await createRecord({
        objectName: 'account',
        data: { name: 'Account Y' },
      });
      recordIds.recordOfX = await createAccessRecordOfAccount(
        recordIds.accountX,
      );
      recordIds.recordOfY = await createAccessRecordOfAccount(
        recordIds.accountY,
      );
      await joinAccountTeam({
        workspaceMemberId: teamMemberId,
        accountId: recordIds.accountX,
      });
      await syncAccessGroups();
      await runPendingComputes();
      await getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
      ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
        workspaceId: workspace.workspaceId,
        objectMetadataId: workspace.objectMetadataId,
      });
    });

    it('should look up the account team rule by value', async () => {
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
        }).flatMap(({ type, keys }) =>
          keys.map(({ columnName }) => `${type}:${columnName}`),
        ),
      ).toEqual(['RLS_MEMBER_VALUE:accountId']);
    });

    it('should let a team member read the records of their accounts only', async () => {
      const candidateRecordIds = [recordIds.recordOfX, recordIds.recordOfY];

      expect(
        await findReadableRecordIds({
          workspaceMemberId: teamMemberId,
          candidateRecordIds,
        }),
      ).toEqual([recordIds.recordOfX]);
      expect(
        await findReadableRecordIds({
          workspaceMemberId: outsiderId,
          candidateRecordIds,
        }),
      ).toEqual([]);
    });

    it('should let a member joining an existing team read its records without planning any compute', async () => {
      await joinAccountTeam({
        workspaceMemberId: outsiderId,
        accountId: recordIds.accountX,
      });
      await syncAccessGroups();

      const { data } = await findAccessGroupPropagationProgress({
        expectToFail: false,
        token: findWorkspace().adminAccessToken,
      });

      expect(data.accessGroupPropagationProgress.isInProgress).toBe(false);
      expect(
        await findReadableRecordIds({
          workspaceMemberId: outsiderId,
          candidateRecordIds: [recordIds.recordOfX, recordIds.recordOfY],
        }),
      ).toEqual([recordIds.recordOfX]);
    });

    it('should let the first team member of an account read its records once the sync applies its group', async () => {
      recordIds.accountZ = await createRecord({
        objectName: 'account',
        data: { name: 'Account Z' },
      });
      recordIds.recordOfZ = await createAccessRecordOfAccount(
        recordIds.accountZ,
      );
      await joinAccountTeam({
        workspaceMemberId: teamMemberId,
        accountId: recordIds.accountZ,
      });
      await syncAccessGroups();
      await runPendingComputes();

      expect(
        await findReadableRecordIds({
          workspaceMemberId: teamMemberId,
          candidateRecordIds: [
            recordIds.recordOfX,
            recordIds.recordOfY,
            recordIds.recordOfZ,
          ],
        }),
      ).toEqual([recordIds.recordOfX, recordIds.recordOfZ]);
    });
  },
});
