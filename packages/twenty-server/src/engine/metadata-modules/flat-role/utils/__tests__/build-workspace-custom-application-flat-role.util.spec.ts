import { WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/core-modules/application/constants/workspace-custom-application-role.constant';
import { buildAdminFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-admin-flat-role.util';
import { buildWorkspaceCustomApplicationFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-workspace-custom-application-flat-role.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const CUSTOM_APPLICATION = {
  id: '20202020-0000-4000-8000-0000000000a2',
  universalIdentifier: '20202020-0000-4000-8000-0000000000a2',
};

describe('buildWorkspaceCustomApplicationFlatRole', () => {
  const customApplicationRole = buildWorkspaceCustomApplicationFlatRole({
    workspaceId: WORKSPACE_ID,
    workspaceCustomFlatApplication: CUSTOM_APPLICATION,
  });

  const adminRole = buildAdminFlatRole({
    workspaceId: WORKSPACE_ID,
    ownerFlatApplication: CUSTOM_APPLICATION,
  });

  it('is owned by the custom application', () => {
    expect(customApplicationRole).toMatchObject({
      universalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
      applicationId: CUSTOM_APPLICATION.id,
      applicationUniversalIdentifier: CUSTOM_APPLICATION.universalIdentifier,
      workspaceId: WORKSPACE_ID,
    });
  });

  it('grants the same permissions as Admin', () => {
    expect(customApplicationRole).toMatchObject({
      canUpdateAllSettings: adminRole.canUpdateAllSettings,
      canAccessAllTools: adminRole.canAccessAllTools,
      canAccessAllAgentChatChannels: adminRole.canAccessAllAgentChatChannels,
      canReadAllObjectRecords: adminRole.canReadAllObjectRecords,
      canUpdateAllObjectRecords: adminRole.canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords: adminRole.canSoftDeleteAllObjectRecords,
      canDestroyAllObjectRecords: adminRole.canDestroyAllObjectRecords,
    });
  });

  it('is locked and assignable to nobody', () => {
    expect(customApplicationRole).toMatchObject({
      isEditable: false,
      canBeAssignedToUsers: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
    });
  });

  it('uses the given label', () => {
    expect(
      buildWorkspaceCustomApplicationFlatRole({
        workspaceId: WORKSPACE_ID,
        workspaceCustomFlatApplication: CUSTOM_APPLICATION,
        label: 'Another label',
      }).label,
    ).toBe('Another label');
  });
});
