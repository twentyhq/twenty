import { isDefined } from 'twenty-shared/utils';

export const mergeFieldIdByUniversalIdentifier = (
  existing: Record<string, string> | undefined,
  incoming: Record<string, string> | undefined,
): Record<string, string> | undefined => {
  if (!isDefined(existing) && !isDefined(incoming)) {
    return undefined;
  }

  return {
    ...existing,
    ...incoming,
  };
};
