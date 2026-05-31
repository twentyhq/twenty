import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export type ObjectMetadataWithFieldsDTO = ObjectMetadataDTO & {
  fields: FieldMetadataDTO[];
};
