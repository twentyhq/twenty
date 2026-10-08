import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

export const renameMorphRelationFlatFieldMetadataToMorphName = <
  TFlatFieldMetadata extends
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
>({
  morphRelationFlatFieldMetadata,
  flatObjectMetadataMaps,
}: {
  morphRelationFlatFieldMetadata: TFlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): TFlatFieldMetadata => {
  const relationTargetFlatObjectMetadata =
    findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId:
        morphRelationFlatFieldMetadata.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

  return {
    ...morphRelationFlatFieldMetadata,
    name: getMorphNameFromMorphFieldMetadataName({
      morphRelationFlatFieldMetadata,
      nameSingular: relationTargetFlatObjectMetadata.nameSingular,
      namePlural: relationTargetFlatObjectMetadata.namePlural,
    }),
  };
};
