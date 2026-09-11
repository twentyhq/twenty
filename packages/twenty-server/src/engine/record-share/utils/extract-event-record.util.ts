import { isPlainObject } from 'twenty-shared/utils';

// A database event carries the row it describes: the post-state when there is
// one, the pre-state for a destruction
export const extractEventRecord = (
  properties: unknown,
): Record<string, unknown> => {
  if (!isPlainObject(properties)) {
    return {};
  }

  const { before, after } = properties as { before?: unknown; after?: unknown };

  return {
    ...(isPlainObject(before) ? before : {}),
    ...(isPlainObject(after) ? after : {}),
  };
};
