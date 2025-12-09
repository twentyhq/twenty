import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type ExtractRecordTypeOrmNullableDateProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-non-nullable-date-properties.type copy';
import { type ExtractRecordTypeOrmNonNullableDateProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-nullable-date-properties.type';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type ViewFieldEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    ViewFieldEntity,
    FieldMetadataEntity | ViewEntity | WorkspaceEntity
  >;

export type ViewFieldEntityNullableDateProperties =
  ExtractRecordTypeOrmNullableDateProperties<ViewFieldEntity>;

export type ViewFieldEntityNonNullableDateProperties =
  ExtractRecordTypeOrmNonNullableDateProperties<ViewFieldEntity>;

export type FlatViewField = FlatEntityFrom<
  ViewFieldEntity,
  ViewFieldEntityRelationProperties,
  ViewFieldEntityNonNullableDateProperties,
  ViewFieldEntityNullableDateProperties
>;
