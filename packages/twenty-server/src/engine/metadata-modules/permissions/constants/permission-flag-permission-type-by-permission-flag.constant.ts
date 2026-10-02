import { PermissionFlagType } from 'twenty-shared/constants';

import { type PermissionFlagPermissionType } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';

export const PERMISSION_FLAG_PERMISSION_TYPE_BY_PERMISSION_FLAG = {
  [PermissionFlagType.API_KEYS_AND_WEBHOOKS]: 'settings',
  [PermissionFlagType.WORKSPACE]: 'settings',
  [PermissionFlagType.WORKSPACE_MEMBERS]: 'settings',
  [PermissionFlagType.ROLES]: 'settings',
  [PermissionFlagType.DATA_MODEL]: 'settings',
  [PermissionFlagType.SECURITY]: 'settings',
  [PermissionFlagType.WORKFLOWS]: 'settings',
  [PermissionFlagType.IMPERSONATE]: 'settings',
  [PermissionFlagType.SSO_BYPASS]: 'settings',
  [PermissionFlagType.APPLICATIONS]: 'settings',
  [PermissionFlagType.MARKETPLACE_APPS]: 'settings',
  [PermissionFlagType.LAYOUTS]: 'settings',
  [PermissionFlagType.BILLING]: 'settings',
  [PermissionFlagType.AI_SETTINGS]: 'settings',
  [PermissionFlagType.AI]: 'tool',
  [PermissionFlagType.VIEWS]: 'tool',
  [PermissionFlagType.UPLOAD_FILE]: 'tool',
  [PermissionFlagType.DOWNLOAD_FILE]: 'tool',
  [PermissionFlagType.SEND_EMAIL_TOOL]: 'tool',
  [PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL]: 'tool',
  [PermissionFlagType.HTTP_REQUEST_TOOL]: 'tool',
  [PermissionFlagType.CODE_INTERPRETER_TOOL]: 'tool',
  [PermissionFlagType.IMPORT_CSV]: 'tool',
  [PermissionFlagType.EXPORT_CSV]: 'tool',
  [PermissionFlagType.CONNECTED_ACCOUNTS]: 'tool',
  [PermissionFlagType.PROFILE_INFORMATION]: 'tool',
} as const satisfies Record<PermissionFlagType, PermissionFlagPermissionType>;
