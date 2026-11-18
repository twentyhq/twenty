import {
  type UniversalViewFieldRelationScope,
  type ViewFieldRelationScope,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// An id that no longer resolves becomes null, which the view field validator rejects
export const fromViewFieldRelationScopeToUniversalRelationScope = ({
  relationScope,
  fieldMetadataUniversalIdentifierById,
}: {
  relationScope: ViewFieldRelationScope;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
}): UniversalViewFieldRelationScope => {
  const toUniversalIdentifier = (fieldMetadataId: string) =>
    fieldMetadataUniversalIdentifierById[fieldMetadataId] ?? null;

  return {
    ...relationScope,
    filters: relationScope.filters.map(
      ({ fieldMetadataId, relationTargetFieldMetadataId, ...filter }) => ({
        ...filter,
        fieldMetadataUniversalIdentifier:
          toUniversalIdentifier(fieldMetadataId),
        ...(isDefined(relationTargetFieldMetadataId)
          ? {
              relationTargetFieldMetadataUniversalIdentifier:
                toUniversalIdentifier(relationTargetFieldMetadataId),
            }
          : {}),
      }),
    ),
    sorts: relationScope.sorts.map(
      ({ fieldMetadataId, relationTargetFieldMetadataId, ...sort }) => ({
        ...sort,
        fieldMetadataUniversalIdentifier:
          toUniversalIdentifier(fieldMetadataId),
        ...(isDefined(relationTargetFieldMetadataId)
          ? {
              relationTargetFieldMetadataUniversalIdentifier:
                toUniversalIdentifier(relationTargetFieldMetadataId),
            }
          : {}),
      }),
    ),
  };
};
