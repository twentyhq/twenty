import {
  type UniversalViewFieldRelationScope,
  type ViewFieldRelationScope,
} from 'twenty-shared/types';

import { fromRelationScopeFieldReferenceToUniversalFieldReference } from 'src/engine/metadata-modules/flat-view-field/utils/from-relation-scope-field-reference-to-universal-field-reference.util';

export const fromViewFieldRelationScopeToUniversalRelationScope = ({
  relationScope,
  fieldMetadataUniversalIdentifierById,
}: {
  relationScope: ViewFieldRelationScope;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
}): UniversalViewFieldRelationScope => ({
  ...relationScope,
  filters: relationScope.filters.map(
    ({ fieldMetadataId, relationTargetFieldMetadataId, ...filter }) => ({
      ...filter,
      ...fromRelationScopeFieldReferenceToUniversalFieldReference({
        fieldReference: { fieldMetadataId, relationTargetFieldMetadataId },
        fieldMetadataUniversalIdentifierById,
      }),
    }),
  ),
  sorts: relationScope.sorts.map(
    ({ fieldMetadataId, relationTargetFieldMetadataId, ...sort }) => ({
      ...sort,
      ...fromRelationScopeFieldReferenceToUniversalFieldReference({
        fieldReference: { fieldMetadataId, relationTargetFieldMetadataId },
        fieldMetadataUniversalIdentifierById,
      }),
    }),
  ),
});
