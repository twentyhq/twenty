import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { WORKFLOW_OBJECT_PERMISSION_RULE } from 'src/engine/metadata-modules/role/constants/workflow-object-permission-rule.constant';
import { type ImplicitObjectPermissionRules } from 'src/engine/metadata-modules/role/types/implicit-object-permission-rules.type';

export const IMPLICIT_OBJECT_PERMISSION_RULES: ImplicitObjectPermissionRules = {
  // Record access follows canUpdateAllSettings or the permission flag, object overrides are ignored
  settingsGatedObjectRuleByUniversalIdentifier: {
    [STANDARD_OBJECTS.workflow.universalIdentifier]:
      WORKFLOW_OBJECT_PERMISSION_RULE,
    [STANDARD_OBJECTS.workflowRun.universalIdentifier]:
      WORKFLOW_OBJECT_PERMISSION_RULE,
    [STANDARD_OBJECTS.workflowVersion.universalIdentifier]:
      WORKFLOW_OBJECT_PERMISSION_RULE,
    [STANDARD_OBJECTS.workspaceMember.universalIdentifier]: {
      permissionFlag: PermissionFlagType.WORKSPACE_MEMBERS,
      isAlwaysReadable: true,
      appliesFieldPermissions: true,
    },
  },
  // Record access is additionally restricted to roles with AI access
  aiGatedObjectUniversalIdentifiers: [
    STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  ],
  // Applies to system objects that have no object override
  systemObjectDefaultRecordPermission: true,
};
