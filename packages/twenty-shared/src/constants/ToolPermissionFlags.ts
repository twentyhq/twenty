import { PermissionFlagType } from './PermissionFlagType';

export const TOOL_PERMISSION_FLAGS: readonly PermissionFlagType[] = [
  PermissionFlagType.AI,
  PermissionFlagType.VIEWS,
  PermissionFlagType.UPLOAD_FILE,
  PermissionFlagType.DOWNLOAD_FILE,
  PermissionFlagType.SEND_EMAIL_TOOL,
  PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
  PermissionFlagType.HTTP_REQUEST_TOOL,
  PermissionFlagType.IMPORT_CSV,
  PermissionFlagType.EXPORT_CSV,
  PermissionFlagType.CONNECTED_ACCOUNTS,
  PermissionFlagType.PROFILE_INFORMATION,
  PermissionFlagType.CODE_INTERPRETER_TOOL,
];
