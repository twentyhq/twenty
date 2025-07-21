import { IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

export type ObjectMetadataItemWithFieldMaps = Omit<
  ObjectMetadataEntity,
  'fields'
> & {
  fieldsById: FieldMetadataMap;
  fieldIdByJoinColumnName: Record<string, string>;
  fieldIdByName: Record<string, string>;
  indexMetadatas: IndexMetadataInterface[];
};
