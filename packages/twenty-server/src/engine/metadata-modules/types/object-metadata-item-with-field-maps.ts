import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

export type ObjectMetadataItemWithFieldMaps = Omit<
  ObjectMetadataInterface,
  'fields'
> & {
  fieldsById: FieldMetadataMap;
  fieldIdByJoinColumnName: Record<string, string>;
  fieldIdByName: Record<string, string>;
  indexMetadatas: IndexMetadataInterface[];
};
