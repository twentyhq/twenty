import { type DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { type ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

export type MetadataEntitiesRelationTarget =
  | ObjectMetadataEntity
  | FieldMetadataEntity
  | IndexFieldMetadataEntity
  | FieldPermissionEntity
  | DataSourceEntity
  | ApplicationEntity
  | IndexMetadataEntity
  | ObjectPermissionEntity;
