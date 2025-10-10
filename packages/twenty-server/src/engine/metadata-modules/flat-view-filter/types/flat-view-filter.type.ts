import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type ViewFilterEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    ViewFilterEntity,
    FieldMetadataEntity | ViewEntity | ViewFilterGroupEntity | Workspace
  >;

export type FlatViewFilter = Omit<
  ViewFilterEntity,
  ViewFilterEntityRelationProperties
> & {
  universalIdentifier: string;
};
