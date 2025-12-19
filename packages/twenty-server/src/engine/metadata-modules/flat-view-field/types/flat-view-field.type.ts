import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

export type ViewFieldEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<ViewFieldEntity>;

export type FlatViewField = FlatEntityFrom<
  ViewFieldEntity,
  ViewFieldEntityRelationProperties
>;
