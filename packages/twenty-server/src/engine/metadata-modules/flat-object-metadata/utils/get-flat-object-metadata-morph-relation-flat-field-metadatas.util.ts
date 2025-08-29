import { isDefined } from 'class-validator';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FieldMetadataType } from 'twenty-shared/types';

type GetFlatObjectMetadataMorphRelationFlatFieldMetadatasArgs = {
  flatObjectMetadata: FlatObjectMetadata;
};
export const getFlatObjectMetadataMorphRelationFlatFieldMetadatas = ({
  flatObjectMetadata,
}: GetFlatObjectMetadataMorphRelationFlatFieldMetadatasArgs): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] => {
  const initialAccumulator: Record<
    FlatFieldMetadata['name'],
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>
  > = {};
  const objectMorphRelationFlatFieldMetadatasByName =
    flatObjectMetadata.flatFieldMetadatas.reduce((acc, flatFieldMetadata) => {
      if (
        isFlatFieldMetadataEntityOfType(
          flatFieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        ) &&
        !isDefined(initialAccumulator[flatFieldMetadata.name])
      ) {
        return {
          ...acc,
          [flatFieldMetadata.name]: flatFieldMetadata,
        };
      }

      return acc;
    }, initialAccumulator);
  return Object.values(objectMorphRelationFlatFieldMetadatasByName);
};
