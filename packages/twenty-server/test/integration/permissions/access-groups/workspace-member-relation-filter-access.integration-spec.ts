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
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type RowLevelPermissionRulePredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-rules.input';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';

const SEAT_OBJECT_NAME = 'accessRecordTeamSeat';
const VISIBILITY_TIER_RECORDS: PermissionTestRecordName[] = [
  'lowVisibilityTier',
  'mediumVisibilityTier',
  'fullVisibilityTier',
];

describePermissionTestWorkspace({
  name: 'access through a filtered relation of the workspace member',
  defineTests: ({ findWorkspace }) => {
    let leadMemberId: string;
    let seatMemberId: string;
    let roleId: string;
    let mediumSeatId: string;
    let recordCompanyFieldMetadataId: string;
    let seatCompanyFieldMetadataId: string;
    let memberSeatsFieldMetadataId: string;
    let seatRoleFieldMetadataId: string;
    let companyObjectMetadataId: string;
    let companyIdFieldMetadataId: string;
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

    const takeSeat = ({
      workspaceMemberId,
      record,
      seatRole,
    }: {
      workspaceMemberId: string;
      record: PermissionTestRecordName;
      seatRole: 'LEAD' | 'MEMBER';
    }) =>
      createRecord({
        objectName: SEAT_OBJECT_NAME,
        data: {
          companyId: companyIds[record],
          memberId: workspaceMemberId,
          seatRole,
        },
      });

    const syncAndCompute = async () => {
      await waitForAllJobsToFinish();
      await getAppProviderByClassName<AccessGroupSyncService>(
        'AccessGroupSyncService',
      ).syncAccessGroups({ workspaceId: findWorkspace().workspaceId });
      await getAppProviderByClassName<DeferredWorkspaceOperationRunnerService>(
        'DeferredWorkspaceOperationRunnerService',
      ).runPendingOperations(findWorkspace().workspaceId);
    };

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

    const buildLeadSeatPredicate = (
      overrides: Partial<RowLevelPermissionRulePredicateInput> = {},
    ): RowLevelPermissionRulePredicateInput => ({
      id: v4(),
      fieldMetadataId: recordCompanyFieldMetadataId,
      operand: RowLevelPermissionPredicateOperand.IS,
      workspaceMemberRelationFieldMetadataId: memberSeatsFieldMetadataId,
      workspaceMemberFieldMetadataId: seatCompanyFieldMetadataId,
      workspaceMemberRelationFilterFieldMetadataId: seatRoleFieldMetadataId,
      workspaceMemberRelationFilterValues: ['LEAD'],
      ...overrides,
    });

    const upsertRule = ({
      predicate,
      shouldFail = false,
    }: {
      predicate: RowLevelPermissionRulePredicateInput;
      shouldFail?: boolean;
    }) =>
      upsertRowLevelPermissionRules({
        input: {
          roleId,
          objectMetadataId: findWorkspace().objectMetadataId,
          rules: [{ canReadRecords: true, predicates: [predicate] }],
        },
        expectToFail: shouldFail,
        token: findWorkspace().adminAccessToken,
      });

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
      const findObjectMetadataId = (nameSingular: string): string => {
        const objectMetadataId = objects.find(
          (object) => object.nameSingular === nameSingular,
        )?.id;

        if (!isDefined(objectMetadataId)) {
          throw new Error(`${nameSingular} object metadata not found`);
        }

        return objectMetadataId;
      };
      companyObjectMetadataId = findObjectMetadataId('company');

      const companyIdField = objects
        .find(({ nameSingular }) => nameSingular === 'company')
        ?.fieldsList.find(({ name }) => name === 'id');

      if (!isDefined(companyIdField)) {
        throw new Error('company.id field metadata not found');
      }

      companyIdFieldMetadataId = companyIdField.id;

      const { data: seatObjectData } = await createOneObjectMetadata({
        input: {
          nameSingular: SEAT_OBJECT_NAME,
          namePlural: `${SEAT_OBJECT_NAME}s`,
          labelSingular: SEAT_OBJECT_NAME,
          labelPlural: `${SEAT_OBJECT_NAME}s`,
          icon: 'IconUsers',
        },
        gqlFields: 'id',
        expectToFail: false,
        token,
      });
      const seatObjectMetadataId = seatObjectData.createOneObject.id;

      const [recordCompanyField, seatCompanyField, seatMemberField] =
        await Promise.all(
          [
            {
              objectMetadataId: workspace.objectMetadataId,
              name: 'company',
              targetObjectMetadataId: companyObjectMetadataId,
              targetFieldLabel: 'Access records',
            },
            {
              objectMetadataId: seatObjectMetadataId,
              name: 'company',
              targetObjectMetadataId: companyObjectMetadataId,
              targetFieldLabel: 'Access record seats',
            },
            {
              objectMetadataId: seatObjectMetadataId,
              name: 'member',
              targetObjectMetadataId: findObjectMetadataId('workspaceMember'),
              targetFieldLabel: 'Access record seats',
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
      const { data: seatRoleData } = await createOneFieldMetadata({
        input: {
          objectMetadataId: seatObjectMetadataId,
          name: 'seatRole',
          label: 'seatRole',
          type: FieldMetadataType.SELECT,
          isNullable: true,
          options: ['LEAD', 'MEMBER'].map((value, position) => ({
            label: value,
            value,
            color: 'blue',
            position,
          })),
        },
        gqlFields: 'id',
        expectToFail: false,
        token,
      });

      recordCompanyFieldMetadataId = recordCompanyField.id;
      seatCompanyFieldMetadataId = seatCompanyField.id;
      memberSeatsFieldMetadataId =
        seatMemberField.relation.targetFieldMetadata.id;
      seatRoleFieldMetadataId = seatRoleData.createOneField.id;

      const { data: roleData } = await createOneRole({
        input: {
          label: 'Lead seats',
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

      roleId = roleData.createOneRole.id;

      await revokeObjectRecordsPermissions({
        roleId,
        objectMetadataId: workspace.objectMetadataId,
        token,
      });
      await upsertRule({ predicate: buildLeadSeatPredicate() });

      leadMemberId = workspace.workspaceMemberIds.none;
      seatMemberId = workspace.workspaceMemberIds.rowLevel;

      for (const workspaceMemberId of [leadMemberId, seatMemberId]) {
        await updateWorkspaceMemberRole({
          input: { workspaceMemberId, roleId },
          expectToFail: false,
          token,
        });
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

      await takeSeat({
        workspaceMemberId: leadMemberId,
        record: 'lowVisibilityTier',
        seatRole: 'LEAD',
      });
      mediumSeatId = await takeSeat({
        workspaceMemberId: leadMemberId,
        record: 'mediumVisibilityTier',
        seatRole: 'MEMBER',
      });
      await takeSeat({
        workspaceMemberId: seatMemberId,
        record: 'fullVisibilityTier',
        seatRole: 'MEMBER',
      });

      await syncAndCompute();
      await getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
      ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
        workspaceId: workspace.workspaceId,
        objectMetadataId: workspace.objectMetadataId,
      });
    });

    it('should only read through the relation rows that match the filter', async () => {
      expect(await findReadableVisibilityTierRecords(leadMemberId)).toEqual([
        'lowVisibilityTier',
      ]);
      expect(await findReadableVisibilityTierRecords(seatMemberId)).toEqual([]);
    });

    it('should give access once the filtered field of a relation row changes', async () => {
      const response = await makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: SEAT_OBJECT_NAME,
          gqlFields: 'id',
          recordId: mediumSeatId,
          data: { seatRole: 'LEAD' },
        }),
        findWorkspace().adminAccessToken,
      );

      expect(response.body.errors).toBeUndefined();

      await syncAndCompute();

      expect(await findReadableVisibilityTierRecords(leadMemberId)).toEqual([
        'lowVisibilityTier',
        'mediumVisibilityTier',
      ]);
    });

    it('should compare a record id with the records the member relation rows point to', async () => {
      const { errors } = await upsertRowLevelPermissionRules({
        input: {
          roleId,
          objectMetadataId: companyObjectMetadataId,
          rules: [
            {
              canReadRecords: true,
              canUpdateRecords: true,
              predicates: [
                buildLeadSeatPredicate({
                  fieldMetadataId: companyIdFieldMetadataId,
                }),
              ],
            },
          ],
        },
        expectToFail: false,
        token: findWorkspace().adminAccessToken,
      });

      expect(errors).toBeUndefined();
    });

    it.each([
      {
        title: 'a filter without a workspace member relation',
        overrides: (): Partial<RowLevelPermissionRulePredicateInput> => ({
          workspaceMemberRelationFieldMetadataId: null,
        }),
      },
      {
        title: 'a filter without values',
        overrides: (): Partial<RowLevelPermissionRulePredicateInput> => ({
          workspaceMemberRelationFilterValues: [],
        }),
      },
      {
        title: 'a filter on a relation field',
        overrides: (): Partial<RowLevelPermissionRulePredicateInput> => ({
          workspaceMemberRelationFilterFieldMetadataId:
            seatCompanyFieldMetadataId,
        }),
      },
      {
        title: 'a filter on a field of another object',
        overrides: (): Partial<RowLevelPermissionRulePredicateInput> => ({
          workspaceMemberRelationFilterFieldMetadataId:
            recordCompanyFieldMetadataId,
        }),
      },
    ])('should refuse $title', async ({ overrides }) => {
      const { errors } = await upsertRule({
        predicate: buildLeadSeatPredicate(overrides()),
        shouldFail: true,
      });

      expect(errors).toBeDefined();
    });
  },
});
