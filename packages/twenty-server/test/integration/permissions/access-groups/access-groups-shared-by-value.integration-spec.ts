import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  FeatureFlagKey,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OPPORTUNITY_ID_BY_STAGE = {
  MEETING: v4(),
  PROPOSAL: v4(),
  CUSTOMER: v4(),
};
const TEST_OPPORTUNITY_IDS = Object.values(OPPORTUNITY_ID_BY_STAGE);

describe('access groups shared by value (integration)', () => {
  let objectMetadataId: string;
  let stageFieldMetadataId: string;
  let originalMemberRoleId: string;
  let memberRoleId: string;
  let otherRoleId: string;
  const memberRuleId = v4();

  const upsertStageRule = ({
    roleId,
    ruleId,
    stages,
  }: {
    roleId: string;
    ruleId: string;
    stages: string[];
  }) =>
    upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        rules: [
          {
            canReadRecords: true,
            predicateGroups: [
              {
                id: ruleId,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                predicates: [
                  {
                    id: v4(),
                    fieldMetadataId: stageFieldMetadataId,
                    operand: RowLevelPermissionPredicateOperand.IS,
                    value: stages,
                  },
                ],
              },
            ],
          },
        ],
      },
    });

  const syncAccessGroups = () =>
    getAppProviderByClassName<AccessGroupSyncService>(
      'AccessGroupSyncService',
    ).syncAccessGroups(SEED_APPLE_WORKSPACE_ID);

  const recomputeOpportunities = () =>
    getAppProviderByClassName<RecordAccessGroupComputationService>(
      'RecordAccessGroupComputationService',
    ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
    });

  const setFeatureFlag = ({
    featureFlag,
    value,
  }: {
    featureFlag: FeatureFlagKey;
    value: boolean;
  }) => updateFeatureFlag({ featureFlag, value, expectToFail: false });

  const findOpportunityIdsAsMember = async (): Promise<string[]> => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        filter: { id: { in: TEST_OPPORTUNITY_IDS } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.opportunities.edges
      .map((edge: { node: { id: string } }) => edge.node.id)
      .sort();
  };

  const createStageRuleRole = async ({
    label,
    ruleId,
    stages,
  }: {
    label: string;
    ruleId: string;
    stages: string[];
  }): Promise<string> => {
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label,
        description: label,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });
    const roleId = data.createOneRole.id;

    await revokeObjectRecordsPermissions({ roleId, objectMetadataId });
    await upsertStageRule({ roleId, ruleId, stages });

    return roleId;
  };

  beforeAll(async () => {
    objectMetadataId = await findObjectMetadataIdByName('opportunity');
    stageFieldMetadataId = await findFieldMetadataIdByName({
      objectMetadataId,
      fieldName: 'stage',
    });

    const createResponse = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: Object.entries(OPPORTUNITY_ID_BY_STAGE).map(([stage, id]) => ({
          id,
          name: `Shared by value ${stage}`,
          stage,
        })),
      }),
    );

    expect(createResponse.body.errors).toBeUndefined();

    memberRoleId = await createStageRuleRole({
      label: 'Shared by value member',
      ruleId: memberRuleId,
      stages: ['MEETING', 'PROPOSAL'],
    });
    otherRoleId = await createStageRuleRole({
      label: 'Shared by value other',
      ruleId: v4(),
      stages: ['CUSTOMER'],
    });

    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: memberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
    await setFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
      value: true,
    });
    await syncAccessGroups();
    await recomputeOpportunities();
  });

  afterAll(async () => {
    await setFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
      value: false,
    });
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: memberRoleId },
    });
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: otherRoleId },
    });
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        filter: { id: { in: TEST_OPPORTUNITY_IDS } },
      }),
    );
  });

  const setMemberStages = async (stages: string[]) => {
    await upsertStageRule({
      roleId: memberRoleId,
      ruleId: memberRuleId,
      stages,
    });
    await syncAccessGroups();
  };

  it('should read the records of every value the rule lists', async () => {
    expect(await findOpportunityIdsAsMember()).toEqual(
      [
        OPPORTUNITY_ID_BY_STAGE.MEETING,
        OPPORTUNITY_ID_BY_STAGE.PROPOSAL,
      ].sort(),
    );
  });

  it('should read the records of a value another role already lists without recomputing them', async () => {
    await setMemberStages(['MEETING', 'CUSTOMER']);

    try {
      expect(await findOpportunityIdsAsMember()).toEqual(
        [
          OPPORTUNITY_ID_BY_STAGE.MEETING,
          OPPORTUNITY_ID_BY_STAGE.CUSTOMER,
        ].sort(),
      );
    } finally {
      await setMemberStages(['MEETING', 'PROPOSAL']);
      await recomputeOpportunities();
    }
  });

  it('should keep reaching only its value once the role a shared group was stored with is deleted', async () => {
    await setMemberStages(['CUSTOMER']);
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: otherRoleId },
    });
    await syncAccessGroups();
    await recomputeOpportunities();

    try {
      expect(await findOpportunityIdsAsMember()).toEqual([
        OPPORTUNITY_ID_BY_STAGE.CUSTOMER,
      ]);
    } finally {
      otherRoleId = await createStageRuleRole({
        label: 'Shared by value other',
        ruleId: v4(),
        stages: ['CUSTOMER'],
      });
      await setMemberStages(['MEETING', 'PROPOSAL']);
      await recomputeOpportunities();
    }
  });
});
