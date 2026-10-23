import { WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/core-modules/application/constants/workspace-custom-application-role.constant';
import { buildWorkspaceCustomApplicationFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-workspace-custom-application-flat-role.util';
import { STANDARD_FLAT_ROLE_METADATA_BUILDERS_BY_ROLE_NAME } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-metadata/create-standard-flat-role-metadata.util';
import { type CreateStandardRoleArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-metadata/create-standard-role-flat-metadata.util';

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

  const adminRole = STANDARD_FLAT_ROLE_METADATA_BUILDERS_BY_ROLE_NAME.admin({
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: '20202020-0000-4000-8000-0000000000a1',
    now: '2026-01-01T00:00:00.000Z',
  } as Omit<CreateStandardRoleArgs, 'context'>);

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
