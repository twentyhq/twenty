import {
  type UniversalViewFieldRelationScope,
  type ViewFieldRelationScopeFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type RelationScopeFieldReference = Pick<
  ViewFieldRelationScopeFilter,
  'fieldMetadataId' | 'relationTargetFieldMetadataId'
>;

type UniversalRelationScopeFieldReference = Pick<
  UniversalViewFieldRelationScope['filters'][number],
  | 'fieldMetadataUniversalIdentifier'
  | 'relationTargetFieldMetadataUniversalIdentifier'
>;

// An unresolved id nulls fieldMetadataUniversalIdentifier, which the view field validator rejects,
// because a null relation target means the filter or sort has none
export const fromRelationScopeFieldReferenceToUniversalFieldReference = ({
  fieldReference: { fieldMetadataId, relationTargetFieldMetadataId },
  fieldMetadataUniversalIdentifierById,
}: {
  fieldReference: RelationScopeFieldReference;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
}): UniversalRelationScopeFieldReference => {
  const fieldMetadataUniversalIdentifier =
    fieldMetadataUniversalIdentifierById[fieldMetadataId] ?? null;

  if (!isDefined(relationTargetFieldMetadataId)) {
    return { fieldMetadataUniversalIdentifier };
  }

  const relationTargetFieldMetadataUniversalIdentifier =
    fieldMetadataUniversalIdentifierById[relationTargetFieldMetadataId];

  return isDefined(relationTargetFieldMetadataUniversalIdentifier)
    ? {
        fieldMetadataUniversalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier,
      }
    : { fieldMetadataUniversalIdentifier: null };
};
