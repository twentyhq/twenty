import { type normalizeFindOptionsRelations } from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';

export const removeAgentHistoryFileRelations = (
  value: ReturnType<typeof normalizeFindOptionsRelations>,
): ReturnType<typeof normalizeFindOptionsRelations> =>
  Object.fromEntries(
    Object.entries(value)
      .filter(([name]) => name !== 'file')
      .map(([name, nested]) => [
        name,
        typeof nested === 'object'
          ? removeAgentHistoryFileRelations(nested)
          : nested,
      ]),
  );
