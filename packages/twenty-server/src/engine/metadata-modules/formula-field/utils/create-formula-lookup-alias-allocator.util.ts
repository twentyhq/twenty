import { type WorkspaceComputedLookupShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export const createFormulaLookupAliasAllocator = (): {
  getLookupAlias: (relationFieldName: string) => string;
  getLookupShapes: () => WorkspaceComputedLookupShape[];
} => {
  const lookupAliasByRelationFieldName = new Map<string, string>();

  return {
    getLookupAlias: (relationFieldName) => {
      const lookupAlias =
        lookupAliasByRelationFieldName.get(relationFieldName) ??
        `lookup${lookupAliasByRelationFieldName.size}`;

      lookupAliasByRelationFieldName.set(relationFieldName, lookupAlias);

      return lookupAlias;
    },
    getLookupShapes: () =>
      [...lookupAliasByRelationFieldName].map(([relationFieldName, alias]) => ({
        alias,
        relationFieldName,
      })),
  };
};
