import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { addPermissionTestWorkspaceMember } from 'test/integration/permissions/utils/add-permission-test-workspace-member.util';
import { createPermissionTestTierRole } from 'test/integration/permissions/utils/create-permission-test-tier-role.util';
import { describePermissionTestWorkspace } from 'test/integration/permissions/utils/describe-permission-test-workspace.util';
import { type PermissionTestRecordName } from 'test/integration/permissions/utils/permission-test-workspace.type';
import { upsertPermissionTestTierRule } from 'test/integration/permissions/utils/upsert-permission-test-tier-rule.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';

const TIER_RECORDS: PermissionTestRecordName[] = [
  'goldTier',
  'silverTier',
  'bronzeTier',
];

describePermissionTestWorkspace({
  name: 'access groups shared by value',
  defineTests: ({ findWorkspace }) => {
    const memberRuleId = v4();
    let memberRoleId: string;
    let otherRoleId: string;
    let workspaceMemberId: string;

    const syncAccessGroups = () =>
      getAppProviderByClassName<AccessGroupSyncService>(
        'AccessGroupSyncService',
      ).syncAccessGroups(findWorkspace().workspaceId);

    const recomputeRecords = () =>
      getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
      ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
        workspaceId: findWorkspace().workspaceId,
        objectMetadataId: findWorkspace().objectMetadataId,
      });

    const setMemberTiers = async (tiers: string[]) => {
      await upsertPermissionTestTierRule({
        workspace: findWorkspace(),
        roleId: memberRoleId,
        ruleId: memberRuleId,
        tiers,
      });
      await syncAccessGroups();
    };

    const findReadableTierRecords = async (): Promise<
      PermissionTestRecordName[]
    > => {
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

      for (const record of TIER_RECORDS) {
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

    beforeAll(async () => {
      const workspace = findWorkspace();

      memberRoleId = await createPermissionTestTierRole({
        workspace,
        label: 'Gold and silver',
        ruleId: memberRuleId,
        tiers: ['GOLD', 'SILVER'],
      });
      otherRoleId = await createPermissionTestTierRole({
        workspace,
        label: 'Bronze',
        ruleId: v4(),
        tiers: ['BRONZE'],
      });
      workspaceMemberId = await addPermissionTestWorkspaceMember({
        workspaceId: workspace.workspaceId,
        workspaceOrigin: workspace.workspaceOrigin,
        inviteHash: workspace.inviteHash,
        roleId: memberRoleId,
        adminAccessToken: workspace.adminAccessToken,
      });
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
        value: true,
        workspaceId: workspace.workspaceId,
        expectToFail: false,
      });
      await syncAccessGroups();
      await recomputeRecords();
    });

    it('should read the records of every value the rule lists', async () => {
      expect(await findReadableTierRecords()).toEqual([
        'goldTier',
        'silverTier',
      ]);
    });

    it('should read the records of a value another role already lists without recomputing them', async () => {
      await setMemberTiers(['GOLD', 'BRONZE']);

      expect(await findReadableTierRecords()).toEqual([
        'goldTier',
        'bronzeTier',
      ]);
    });

    it('should keep reaching only its values once the role a shared group was stored with is deleted', async () => {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: otherRoleId },
        token: findWorkspace().adminAccessToken,
      });
      await syncAccessGroups();
      await recomputeRecords();

      expect(await findReadableTierRecords()).toEqual([
        'goldTier',
        'bronzeTier',
      ]);
    });
  },
});
