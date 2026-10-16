import { FieldMetadataType } from 'twenty-shared/types';
import { isMorphRelationHead } from 'twenty-shared/utils';

import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { resolveMorphRelationsFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-morph-relations-from-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const addMorphRelationsToMorphRelationHeadFlatFieldMetadatas = ({
  flatFieldMetadatas,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadatas: FlatFieldMetadata[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): (FlatFieldMetadata & { morphRelations?: RelationDTO[] })[] => {
  const resolveMorphRelations = (morphRelationHead: FlatFieldMetadata) =>
    isFlatFieldMetadataOfType(
      morphRelationHead,
      FieldMetadataType.MORPH_RELATION,
    )
      ? resolveMorphRelationsFromFlatFieldMetadata({
          morphFlatFieldMetadata: morphRelationHead,
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
        })
      : [];

  return flatFieldMetadatas.map((flatFieldMetadata) =>
    isMorphRelationHead<FlatFieldMetadata>(flatFieldMetadata)
      ? {
          ...flatFieldMetadata,
          morphRelations: resolveMorphRelations(flatFieldMetadata),
        }
      : flatFieldMetadata,
  );
};
