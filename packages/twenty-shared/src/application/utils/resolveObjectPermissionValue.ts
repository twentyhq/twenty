export const resolveObjectPermissionValue = ({
  objectValue,
  allObjectsValue,
  isSystemObject,
}: {
  objectValue: boolean | null | undefined;
  allObjectsValue: boolean;
  isSystemObject: boolean;
}): boolean => objectValue ?? (isSystemObject || allObjectsValue);
