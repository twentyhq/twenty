import { PermissionFlagType } from 'twenty-shared/constants';

import { type SettingsGatedObjectPermissionRule } from 'src/engine/metadata-modules/role/types/settings-gated-object-permission-rule.type';

export const WORKFLOW_OBJECT_PERMISSION_RULE: SettingsGatedObjectPermissionRule =
  {
    permissionFlag: PermissionFlagType.WORKFLOWS,
    isAlwaysReadable: false,
    appliesFieldPermissions: false,
  };
