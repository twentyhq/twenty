import {
  type UniversalViewFieldRelationScope,
  type ViewFieldRelationScope,
} from 'twenty-shared/types';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { fromUniversalRelationScopeFieldReferenceToFieldReference } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-field/services/utils/from-universal-relation-scope-field-reference-to-field-reference.util';

export const fromUniversalRelationScopeToViewFieldRelationScope = ({
  universalRelationScope,
  flatFieldMetadataMaps,
}: {
  universalRelationScope: UniversalViewFieldRelationScope;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): ViewFieldRelationScope => ({
  ...universalRelationScope,
  filters: universalRelationScope.filters.map(
    ({
      fieldMetadataUniversalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier,
      ...filter
    }) => ({
      ...filter,
      ...fromUniversalRelationScopeFieldReferenceToFieldReference({
        universalFieldReference: {
          fieldMetadataUniversalIdentifier,
          relationTargetFieldMetadataUniversalIdentifier,
        },
        flatFieldMetadataMaps,
      }),
    }),
  ),
  sorts: universalRelationScope.sorts.map(
    ({
      fieldMetadataUniversalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier,
      ...sort
    }) => ({
      ...sort,
      ...fromUniversalRelationScopeFieldReferenceToFieldReference({
        universalFieldReference: {
          fieldMetadataUniversalIdentifier,
          relationTargetFieldMetadataUniversalIdentifier,
        },
        flatFieldMetadataMaps,
      }),
    }),
  ),
});
