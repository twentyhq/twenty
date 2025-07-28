import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';

export type MetadataEntitiesRelationTarget =
  | ObjectMetadataEntity
  | FieldMetadataEntity
  | IndexFieldMetadataEntity
  | FieldPermissionEntity
  | DataSourceEntity
  | IndexMetadataEntity
  | ObjectPermissionEntity;
