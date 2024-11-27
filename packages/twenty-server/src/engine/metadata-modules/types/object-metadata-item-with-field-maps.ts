import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

export type ObjectMetadataItemWithFieldMaps = ObjectMetadataInterface & {
  fieldsById: FieldMetadataMap;
  fieldsByName: FieldMetadataMap;
};
