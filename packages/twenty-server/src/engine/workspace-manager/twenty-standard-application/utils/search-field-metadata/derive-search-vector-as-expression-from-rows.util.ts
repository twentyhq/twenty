import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import {
  buildSearchVectorTargetField,
  computeSearchVectorAsExpressionFromSearchFieldMetadatas,
} from 'src/engine/metadata-modules/flat-search-field-metadata/utils/compute-search-vector-as-expression-from-search-field-metadatas.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';

// Provisioning derives the searchVector asExpression from the searchFieldMetadata rows
// (the source of truth), mirroring the runtime edit paths, instead of authoring it
// alongside each field. Mutates flatFieldMetadataMaps in place so the assembled maps carry
// the derived expression. An object with no rows clears its expression to the empty
// to_tsvector, keeping a generated-but-empty searchVector column.
export const deriveSearchVectorAsExpressionFromRowsThroughMutation = ({
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
}): void => {
  const flatSearchFieldMetadatas = Object.values(
    flatSearchFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const flatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  for (const flatFieldMetadata of flatFieldMetadatas) {
    if (
      !isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.TS_VECTOR,
      ) ||
      flatFieldMetadata.name !== SEARCH_VECTOR_FIELD.name
    ) {
      continue;
    }

    const targetSearchableFields = flatSearchFieldMetadatas
      .filter(
        (flatSearchFieldMetadata) =>
          flatSearchFieldMetadata.tsVectorFieldMetadataId ===
          flatFieldMetadata.id,
      )
      .map((flatSearchFieldMetadata) => {
        const indexedFlatFieldMetadata =
          findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: flatSearchFieldMetadata.fieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          });

        return buildSearchVectorTargetField(
          indexedFlatFieldMetadata,
          flatSearchFieldMetadata.position,
          flatSearchFieldMetadata.universalIdentifier,
        );
      });

    const asExpression =
      computeSearchVectorAsExpressionFromSearchFieldMetadatas(
        targetSearchableFields,
      );

    replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
      flatEntity: {
        ...flatFieldMetadata,
        universalSettings: {
          ...flatFieldMetadata.universalSettings,
          asExpression,
          generatedType: 'STORED',
        },
      },
      flatEntityMapsToMutate: flatFieldMetadataMaps,
    });
  }
};
