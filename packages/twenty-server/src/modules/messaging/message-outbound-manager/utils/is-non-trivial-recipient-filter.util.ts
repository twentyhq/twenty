import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// Rejects filters that resolve to "no constraint" — empty object, empty
// and/or, and any wrapper around such (e.g. `{ not: { and: [] } }`). Without
// this guard the GraphqlQueryParser walks an empty conjunction and yields no
// WHERE clause, so a malicious caller could blast every Person in the
// workspace.
export const isNonTrivialRecipientFilter = (
  filter: RecordGqlOperationFilter | null | undefined,
): boolean => {
  if (filter === null || filter === undefined) {
    return false;
  }

  if (typeof filter !== 'object' || Array.isArray(filter)) {
    return false;
  }

  const entries = Object.entries(filter as Record<string, unknown>);

  if (entries.length === 0) {
    return false;
  }

  // For boolean combinators, drop them if all branches are themselves trivial.
  // For field-level keys (id, name, ...), presence counts as a real constraint.
  return entries.some(([key, value]) => {
    if (key === 'and' || key === 'or') {
      if (!Array.isArray(value) || value.length === 0) {
        return false;
      }

      return value.some((branch) =>
        isNonTrivialRecipientFilter(branch as RecordGqlOperationFilter),
      );
    }

    if (key === 'not') {
      return isNonTrivialRecipientFilter(value as RecordGqlOperationFilter);
    }

    return true;
  });
};
