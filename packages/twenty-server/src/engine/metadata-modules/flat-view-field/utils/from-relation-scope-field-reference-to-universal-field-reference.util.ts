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

// An id that no longer resolves becomes null, which the view field validator rejects
export const fromRelationScopeFieldReferenceToUniversalFieldReference = ({
  fieldReference: { fieldMetadataId, relationTargetFieldMetadataId },
  fieldMetadataUniversalIdentifierById,
}: {
  fieldReference: RelationScopeFieldReference;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
}): UniversalRelationScopeFieldReference => ({
  fieldMetadataUniversalIdentifier:
    fieldMetadataUniversalIdentifierById[fieldMetadataId] ?? null,
  ...(isDefined(relationTargetFieldMetadataId)
    ? {
        relationTargetFieldMetadataUniversalIdentifier:
          fieldMetadataUniversalIdentifierById[relationTargetFieldMetadataId] ??
          null,
      }
    : {}),
});
