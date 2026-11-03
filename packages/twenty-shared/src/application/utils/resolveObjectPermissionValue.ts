export const resolveObjectPermissionValue = ({
  objectValue,
  hasAllObjectsPermission,
  isSystemObject,
}: {
  objectValue: boolean | null | undefined;
  hasAllObjectsPermission: boolean;
  isSystemObject: boolean;
}): boolean => objectValue ?? (isSystemObject || hasAllObjectsPermission);
