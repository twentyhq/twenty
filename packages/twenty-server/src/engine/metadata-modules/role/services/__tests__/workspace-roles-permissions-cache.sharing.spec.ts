import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { WorkspaceRolesPermissionsCacheService } from 'src/engine/metadata-modules/role/services/workspace-roles-permissions-cache.service';

const compute = ({
  canAccessAllTools = false,
  canUpdateAllSettings = false,
  hasAiFlag = false,
  canUpdateObjectRecords = true,
} = {}) => {
  const service = new WorkspaceRolesPermissionsCacheService();
  return service.computeForCache({
    workspaceId: 'workspace',
    rows: {
      role: [{ id: 'role', canAccessAllTools, canUpdateAllSettings }],
      objectMetadata: [
        {
          id: 'thread',
          isSystem: true,
          universalIdentifier:
            STANDARD_OBJECTS.agentChatThread.universalIdentifier,
        },
      ],
      objectPermission: {
        byRoleId: new Map([
          ['role', [{ objectMetadataId: 'thread', canUpdateObjectRecords }]],
        ]),
      },
      rolePermissionFlag: {
        byRoleId: new Map([
          ['role', hasAiFlag ? [{ permissionFlagId: 'ai' }] : []],
        ]),
      },
      permissionFlag: [
        {
          id: 'ai',
          universalIdentifier: SystemPermissionFlag[PermissionFlagType.AI],
        },
      ],
      fieldPermission: { byRoleId: new Map() },
      rowLevelPermissionPredicate: { byRoleId: new Map() },
      rowLevelPermissionPredicateGroup: { byRoleId: new Map() },
    },
  } as never).role.thread;
};

describe('Conversation role permissions', () => {
  it('grants AI tool access through canAccessAllTools', () => {
    expect(compute({ canAccessAllTools: true })).toMatchObject({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
    });
  });

  it('grants AI tool access through its explicit permission flag', () => {
    expect(compute({ hasAiFlag: true })).toMatchObject({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
    });
  });

  it('does not infer AI access from settings administration', () => {
    expect(compute({ canUpdateAllSettings: true })).toMatchObject({
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canDestroyObjectRecords: false,
      canSoftDeleteObjectRecords: false,
    });
  });

  it('preserves explicit record operation denials for AI-enabled roles', () => {
    expect(
      compute({ canAccessAllTools: true, canUpdateObjectRecords: false }),
    ).toMatchObject({
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
    });
  });
});
