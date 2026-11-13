import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';

type FromMorphOrRelationFlatFieldMetadataToRelationDtoArgs = {
  sourceFlatObjectMetadata: FlatObjectMetadata;
  targetFlatObjectMetadata: FlatObjectMetadata;
  sourceFlatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  targetFlatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
};
export const fromMorphOrRelationFlatFieldMetadataToRelationDto = ({
  sourceFlatFieldMetadata,
  sourceFlatObjectMetadata,
  targetFlatFieldMetadata,
  targetFlatObjectMetadata,
}: FromMorphOrRelationFlatFieldMetadataToRelationDtoArgs) => ({
  type: sourceFlatFieldMetadata.settings.relationType,
  sourceObjectMetadata: fromFlatObjectMetadataToObjectMetadataDto(
    sourceFlatObjectMetadata,
  ),
  sourceFieldMetadata: fromFlatFieldMetadataToFieldMetadataDto(
    sourceFlatFieldMetadata,
  ),
  targetObjectMetadata: fromFlatObjectMetadataToObjectMetadataDto(
    targetFlatObjectMetadata,
  ),
  targetFieldMetadata: fromFlatFieldMetadataToFieldMetadataDto(
    targetFlatFieldMetadata,
  ),
});
