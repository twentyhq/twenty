const ID_SUFFIX = 'Id';
const TARGET_PREFIX = 'target';

export const extractObjectSingularNameFromTargetColumnName = (
  targetColumnName: string,
): string => {
  let result = targetColumnName;

  if (result.endsWith(ID_SUFFIX)) {
    result = result.slice(0, -ID_SUFFIX.length);
  }

  if (
    result.startsWith(TARGET_PREFIX) &&
    result.length > TARGET_PREFIX.length
  ) {
    result =
      result.charAt(TARGET_PREFIX.length).toLowerCase() +
      result.slice(TARGET_PREFIX.length + 1);
  }

  return result;
};
