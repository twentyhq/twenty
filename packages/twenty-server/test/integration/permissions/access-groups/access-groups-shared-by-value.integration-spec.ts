import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { addPermissionTestWorkspaceMember } from 'test/integration/permissions/utils/add-permission-test-workspace-member.util';
import { createPermissionTestVisibilityTierRole } from 'test/integration/permissions/utils/create-permission-test-visibility-tier-role.util';
import { describePermissionTestWorkspace } from 'test/integration/permissions/utils/describe-permission-test-workspace.util';
import { type PermissionTestRecordName } from 'test/integration/permissions/utils/permission-test-workspace.type';
import { upsertPermissionTestVisibilityTierRule } from 'test/integration/permissions/utils/upsert-permission-test-visibility-tier-rule.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';
import { v4 } from 'uuid';

import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';

const VISIBILITY_TIER_RECORDS: PermissionTestRecordName[] = [
  'lowVisibilityTier',
  'mediumVisibilityTier',
  'fullVisibilityTier',
];

describePermissionTestWorkspace({
  name: 'access groups shared by value',
  defineTests: ({ findWorkspace }) => {
    const memberRuleId = v4();
    let memberRoleId: string;
    let otherRoleId: string;
    let workspaceMemberId: string;

    const syncAccessGroups = async () => {
      await getAppProviderByClassName<AccessGroupSyncService>(
        'AccessGroupSyncService',
      ).syncAccessGroups({ workspaceId: findWorkspace().workspaceId });
      await getAppProviderByClassName<DeferredWorkspaceOperationRunnerService>(
        'DeferredWorkspaceOperationRunnerService',
      ).runPendingOperations(findWorkspace().workspaceId);
    };

    const recomputeRecords = () =>
      getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
      ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
        workspaceId: findWorkspace().workspaceId,
        objectMetadataId: findWorkspace().objectMetadataId,
      });

    const setMemberVisibilityTiers = async (visibilityTiers: string[]) => {
      await upsertPermissionTestVisibilityTierRule({
        workspace: findWorkspace(),
        roleId: memberRoleId,
        ruleId: memberRuleId,
        visibilityTiers,
      });
      await syncAccessGroups();
    };

    const findReadableVisibilityTierRecords = async (): Promise<
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

    beforeAll(async () => {
      const workspace = findWorkspace();

      memberRoleId = await createPermissionTestVisibilityTierRole({
        workspace,
        label: 'Low and medium visibility',
        ruleId: memberRuleId,
        visibilityTiers: ['LOW', 'MEDIUM'],
      });
      otherRoleId = await createPermissionTestVisibilityTierRole({
        workspace,
        label: 'Full visibility',
        ruleId: v4(),
        visibilityTiers: ['FULL'],
      });
      workspaceMemberId = await addPermissionTestWorkspaceMember({
        workspaceId: workspace.workspaceId,
        workspaceOrigin: workspace.workspaceOrigin,
        inviteHash: workspace.inviteHash,
        roleId: memberRoleId,
        adminAccessToken: workspace.adminAccessToken,
      });
      await syncAccessGroups();
      await recomputeRecords();
    });

    it('should read the records of every value the rule lists', async () => {
      expect(await findReadableVisibilityTierRecords()).toEqual([
        'lowVisibilityTier',
        'mediumVisibilityTier',
      ]);
    });

    it('should read the records of a value another role already lists without recomputing them', async () => {
      await setMemberVisibilityTiers(['LOW', 'FULL']);

      expect(await findReadableVisibilityTierRecords()).toEqual([
        'lowVisibilityTier',
        'fullVisibilityTier',
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

      expect(await findReadableVisibilityTierRecords()).toEqual([
        'lowVisibilityTier',
        'fullVisibilityTier',
      ]);
    });

    it('should read the records of a value first listed once the sync adds its group to them', async () => {
      await setMemberVisibilityTiers(['LOW', 'MEDIUM', 'FULL']);

      expect(await findReadableVisibilityTierRecords()).toEqual([
        'lowVisibilityTier',
        'mediumVisibilityTier',
        'fullVisibilityTier',
      ]);
    });

    it('should stop reading the records of a value no rule lists once the sync drops its group from them', async () => {
      await setMemberVisibilityTiers(['LOW']);

      expect(await findReadableVisibilityTierRecords()).toEqual([
        'lowVisibilityTier',
      ]);
    });

    it('should reach the same records after a full recompute as after the incremental changes', async () => {
      await setMemberVisibilityTiers(['MEDIUM', 'FULL']);

      const readableRecordsAfterIncrementalChanges =
        await findReadableVisibilityTierRecords();

      await recomputeRecords();

      expect(await findReadableVisibilityTierRecords()).toEqual(
        readableRecordsAfterIncrementalChanges,
      );
      expect(readableRecordsAfterIncrementalChanges).toEqual([
        'mediumVisibilityTier',
        'fullVisibilityTier',
      ]);
    });
  },
});
