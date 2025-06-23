import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

export type ObjectMetadataItemWithFieldMaps = ObjectMetadataInterface & {
  fieldsById: FieldMetadataMap;
  fieldsByName: FieldMetadataMap;
  fieldsByJoinColumnName: FieldMetadataMap;
  indexMetadatas: IndexMetadataInterface[];
};
