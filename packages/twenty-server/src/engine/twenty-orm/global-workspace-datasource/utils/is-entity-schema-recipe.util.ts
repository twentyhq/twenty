import { isDefined } from 'twenty-shared/utils';

// A cold buffer or a Redis payload holds the EntitySchema recipe, whose
// `columns` is a keyed object. A built EntityMetadata exposes `columns` as an
// array, which is what tells the two apart on the way back in.
export const isEntitySchemaRecipe = (entry: unknown): boolean => {
  if (!isDefined(entry) || typeof entry !== 'object') {
    return false;
  }

  const columns = (entry as { columns?: unknown }).columns;

  return !Array.isArray(columns);
};
