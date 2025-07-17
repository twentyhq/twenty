import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';

export type MetadataEntitiesRelationTarget =
  | ObjectMetadataEntity
  | FieldMetadataEntity
  | IndexFieldMetadataEntity
  | FieldPermissionEntity;
