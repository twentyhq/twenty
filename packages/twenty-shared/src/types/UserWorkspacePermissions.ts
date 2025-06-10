import { PermissionsOnAllObjectRecords } from "@/constants";
import { SettingPermissionType } from "@/constants/SettingPermissionType";
import { ObjectRecordsPermissions } from "@/types/ObjectRecordsPermissions";

export type UserWorkspacePermissions = {
  settingsPermissions: Record<SettingPermissionType, boolean>;
  objectRecordsPermissions: Record<PermissionsOnAllObjectRecords, boolean>;
  objectPermissions: ObjectRecordsPermissions // Missleading naming regarding above field name
};