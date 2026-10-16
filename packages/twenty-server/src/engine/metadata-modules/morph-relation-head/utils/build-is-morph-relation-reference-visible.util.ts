import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export const buildIsMorphRelationReferenceVisible =
  ({
    flatFieldMetadataMaps,
    isMorphRelationHeadEnabled,
  }: {
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    isMorphRelationHeadEnabled: boolean;
  }) =>
  (fieldMetadataId: string | null | undefined): boolean => {
    if (!isDefined(fieldMetadataId)) {
      return true;
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (
      !isDefined(flatFieldMetadata) ||
      !isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      )
    ) {
      return true;
    }

    if (isMorphRelationHead(flatFieldMetadata)) {
      return isMorphRelationHeadEnabled;
    }

    return (
      !isMorphRelationHeadEnabled ||
      !isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[flatFieldMetadata.morphId],
      )
    );
  };
