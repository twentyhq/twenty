import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type FromUpdateFieldInputToFlatFieldMetadataToUpdateArgs = {
  updateFieldInput: UpdateFieldInput;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const fromUpdateFieldInputToFlatFieldMetadataToUpdate = ({
  existingFlatObjectMetadataMaps,
  updateFieldInput,
}: FromUpdateFieldInputToFlatFieldMetadataToUpdateArgs): FlatFieldMetadata => {};
