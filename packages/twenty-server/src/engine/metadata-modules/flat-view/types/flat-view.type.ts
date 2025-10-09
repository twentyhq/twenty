import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { type ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type ViewEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    ViewEntity,
    | ObjectMetadataEntity
    | ViewFieldEntity
    | ViewSortEntity
    | ViewFilterEntity
    | ViewGroupEntity
    | ViewFilterGroupEntity
    | Workspace
  >;

export type FlatView = Omit<ViewEntity, ViewEntityRelationProperties> & {
  universalIdentifier: string;
  viewFieldIds: string[];
};
