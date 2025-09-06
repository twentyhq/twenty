import { MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';

export const fromMorphOrRelationFlatFieldMetadataToRelationDto = ({
  flatFieldMetadata,
  sourceFlatObjectMetadata,
}: {
  sourceFlatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
}) => ({
  type: flatFieldMetadata.settings.relationType,
  sourceObjectMetadata: fromFlatObjectMetadataToObjectMetadataDto(
    sourceFlatObjectMetadata,
  ),
  sourceFieldMetadata:
    fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata),
  targetObjectMetadata: fromFlatObjectMetadataToObjectMetadataDto(
    flatFieldMetadata.flatRelationTargetObjectMetadata,
  ),
  targetFieldMetadata: fromFlatFieldMetadataToFieldMetadataDto(
    flatFieldMetadata.flatRelationTargetFieldMetadata,
  ),
});
