import {
  type UniversalViewFieldRelationScope,
  type ViewFieldRelationScope,
  type ViewFieldRelationScopeFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type RelationScopeFieldReference = Pick<
  ViewFieldRelationScopeFilter,
  'fieldMetadataId' | 'relationTargetFieldMetadataId'
>;

// Unresolved ids become null so the validator rejects them; a null relation target means none
const toUniversalFieldReference = <
  TFieldReference extends RelationScopeFieldReference,
>(
  {
    fieldMetadataId,
    relationTargetFieldMetadataId,
    ...fieldReference
  }: TFieldReference,
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>,
) => {
  const fieldMetadataUniversalIdentifier =
    fieldMetadataUniversalIdentifierById[fieldMetadataId] ?? null;

  if (!isDefined(relationTargetFieldMetadataId)) {
    return { ...fieldReference, fieldMetadataUniversalIdentifier };
  }

  const relationTargetFieldMetadataUniversalIdentifier =
    fieldMetadataUniversalIdentifierById[relationTargetFieldMetadataId];

  return isDefined(relationTargetFieldMetadataUniversalIdentifier)
    ? {
        ...fieldReference,
        fieldMetadataUniversalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier,
      }
    : { ...fieldReference, fieldMetadataUniversalIdentifier: null };
};

export const fromViewFieldRelationScopeToUniversalRelationScope = ({
  relationScope,
  fieldMetadataUniversalIdentifierById,
}: {
  relationScope: ViewFieldRelationScope;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
}): UniversalViewFieldRelationScope => ({
  ...relationScope,
  filters: relationScope.filters.map((filter) =>
    toUniversalFieldReference(filter, fieldMetadataUniversalIdentifierById),
  ),
  sorts: relationScope.sorts.map((sort) =>
    toUniversalFieldReference(sort, fieldMetadataUniversalIdentifierById),
  ),
});
