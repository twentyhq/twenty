import { type IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

export type ObjectMetadataItemWithFieldMaps = Omit<
  ObjectMetadataEntity,
  'fields'
> & {
  fieldsById: FieldMetadataMap;
  fieldIdByJoinColumnName: Record<string, string>;
  fieldIdByName: Record<string, string>;
  indexMetadatas: IndexMetadataInterface[];
};
