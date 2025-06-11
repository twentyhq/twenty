import { PermissionsOnAllObjectRecords, SettingPermissionType } from "twenty-shared/constants";
import { ObjectRecordsPermissions } from "twenty-shared/types";

export type UserWorkspacePermissions = {
  settingsPermissions: Record<SettingPermissionType, boolean>;
  objectRecordsPermissions: Record<PermissionsOnAllObjectRecords, boolean>;
  objectPermissions: ObjectRecordsPermissions // Missleading naming regarding above key naming
};