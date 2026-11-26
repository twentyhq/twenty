/* @license Enterprise */
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { describePermissionTestWorkspace } from 'test/integration/permissions/utils/describe-permission-test-workspace.util';
import {
  type PermissionTestExpectedAnswers,
  type PermissionTestPrincipals,
  type PermissionTestRecordName,
} from 'test/integration/permissions/utils/permission-test-workspace.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  type RowLevelPermissionRuleInput,
  type RowLevelPermissionRulePredicateInput,
} from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-rules.input';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';

const SEAT_OBJECT_NAME = 'accessRecordTeamSeat';
const VISIBILITY_TIER_RECORDS: PermissionTestRecordName[] = [
  'lowVisibilityTier',
  'mediumVisibilityTier',
  'fullVisibilityTier',
];

const REACHES_READ_AND_UPDATE: PermissionTestExpectedAnswers = {
  findRecordsActions: {
    canRead: true,
    canUpdate: true,
    canSoftDelete: false,
    canDelete: false,
  },
  canReadRecords: true,
  canUpdateRecords: true,
};

const REACHES_READ_ONLY: PermissionTestExpectedAnswers = {
  findRecordsActions: {
    canRead: true,
    canUpdate: false,
    canSoftDelete: false,
    canDelete: false,
  },
  canReadRecords: true,
  canUpdateRecords: false,
};

const REACHES_NOTHING: PermissionTestExpectedAnswers = {
  findRecordsActions: {
    canRead: false,
    canUpdate: false,
    canSoftDelete: false,
    canDelete: false,
  },
  canReadRecords: false,
  canUpdateRecords: false,
};

const SEATED_MEMBER: Pick<
  PermissionTestPrincipals,
  'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
> = {
  mainPrincipal: { type: 'workspaceMember', role: 'rowLevel' },
  limitingPrincipal: { type: 'none' },
  applicationPrincipal: { type: 'customApplication' },
};

describePermissionTestWorkspace({
  name: 'access through a filtered relation of the workspace member',
  defineTests: ({ findWorkspace, describeRecordAccess }) => {
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

    const syncAndCompute = async () => {
      await waitForAllJobsToFinish();
      await getAppProviderByClassName<AccessGroupSyncService>(
        'AccessGroupSyncService',
      ).syncAccessGroups({ workspaceId: findWorkspace().workspaceId });
      await getAppProviderByClassName<DeferredWorkspaceOperationRunnerService>(
        'DeferredWorkspaceOperationRunnerService',
      ).runPendingOperations(findWorkspace().workspaceId);
    };

    const buildSeatPredicate = (
      overrides: Partial<RowLevelPermissionRulePredicateInput> = {},
    ): RowLevelPermissionRulePredicateInput => ({
      id: v4(),
      fieldMetadataId: recordCompanyFieldMetadataId,
      operand: RowLevelPermissionPredicateOperand.IS,
      workspaceMemberRelationFieldMetadataId: memberSeatsFieldMetadataId,
      workspaceMemberFieldMetadataId: seatCompanyFieldMetadataId,
      ...overrides,
    });

    const buildLeadSeatPredicate = (
      overrides: Partial<RowLevelPermissionRulePredicateInput> = {},
    ): RowLevelPermissionRulePredicateInput =>
      buildSeatPredicate({
        workspaceMemberRelationFilterFieldMetadataId: seatRoleFieldMetadataId,
        workspaceMemberRelationFilterValues: ['LEAD'],
        ...overrides,
      });

    const upsertRules = ({
      objectMetadataId = findWorkspace().objectMetadataId,
      rules,
      shouldFail = false,
    }: {
      objectMetadataId?: string;
      rules: RowLevelPermissionRuleInput[];
      shouldFail?: boolean;
    }) =>
      upsertRowLevelPermissionRules({
        input: {
          roleId: findWorkspace().roleIds.rowLevel,
          objectMetadataId,
          rules,
        },
        expectToFail: shouldFail,
        token: findWorkspace().adminAccessToken,
      });

    beforeAll(async () => {
      const workspace = findWorkspace();
      const token = workspace.adminAccessToken;

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
      const findObjectMetadataOrThrow = (nameSingular: string) => {
        const objectMetadata = objects.find(
          (object) => object.nameSingular === nameSingular,
        );

        if (!isDefined(objectMetadata)) {
          throw new Error(`${nameSingular} object metadata not found`);
        }

        return objectMetadata;
      };
      const companyObjectMetadata = findObjectMetadataOrThrow('company');
      const companyIdField = companyObjectMetadata.fieldsList.find(
        ({ name }) => name === 'id',
      );

      if (!isDefined(companyIdField)) {
        throw new Error('company.id field metadata not found');
      }

      companyObjectMetadataId = companyObjectMetadata.id;
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
              targetObjectMetadataId:
                findObjectMetadataOrThrow('workspaceMember').id,
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

      await upsertRules({
        rules: [
          { canReadRecords: true, predicates: [buildSeatPredicate()] },
          {
            canReadRecords: true,
            canUpdateRecords: true,
            predicates: [buildLeadSeatPredicate()],
          },
        ],
      });

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

      const takeSeat = (
        record: PermissionTestRecordName,
        seatRole: 'LEAD' | 'MEMBER',
      ) =>
        createRecord({
          objectName: SEAT_OBJECT_NAME,
          data: {
            companyId: companyIds[record],
            memberId: workspace.workspaceMemberIds.rowLevel,
            seatRole,
          },
        });

      await takeSeat('lowVisibilityTier', 'LEAD');
      mediumSeatId = await takeSeat('mediumVisibilityTier', 'MEMBER');

      await syncAndCompute();
      await getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
      ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
        workspaceId: workspace.workspaceId,
        objectMetadataId: workspace.objectMetadataId,
      });
    });

    describeRecordAccess({
      name: 'a member reading through every seat and editing through lead seats',
      ...SEATED_MEMBER,
      cases: [
        {
          it: 'reads and edits the record of a lead seat',
          record: 'lowVisibilityTier',
          expected: REACHES_READ_AND_UPDATE,
        },
        {
          it: 'only reads the record of a member seat',
          record: 'mediumVisibilityTier',
          expected: REACHES_READ_ONLY,
        },
        {
          it: 'reaches nothing without a seat',
          record: 'fullVisibilityTier',
          expected: REACHES_NOTHING,
        },
        {
          it: 'reaches nothing as an API key, which has no seats',
          mainPrincipal: { type: 'apiKey', role: 'rowLevel' },
          record: 'lowVisibilityTier',
          expected: REACHES_NOTHING,
        },
      ],
    });

    describe('once the member seat is promoted to lead', () => {
      beforeAll(async () => {
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
      });

      describeRecordAccess({
        name: 'the promoted seat',
        ...SEATED_MEMBER,
        cases: [
          {
            it: 'now gives edit on its record',
            record: 'mediumVisibilityTier',
            expected: REACHES_READ_AND_UPDATE,
          },
        ],
      });
    });

    it('should compare a record id with the records the member relation rows point to', async () => {
      const { errors } = await upsertRules({
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
      const { errors } = await upsertRules({
        rules: [
          {
            canReadRecords: true,
            predicates: [buildLeadSeatPredicate(overrides())],
          },
        ],
        shouldFail: true,
      });

      expect(errors).toBeDefined();
    });
  },
});
