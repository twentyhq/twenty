import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type ViewFilterGroupEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    ViewFilterGroupEntity,
    ViewEntity | ViewFilterGroupEntity | WorkspaceEntity
  >;

export type FlatViewFilterGroup = FlatEntityFrom<
  ViewFilterGroupEntity,
  ViewFilterGroupEntityRelationProperties
>;

