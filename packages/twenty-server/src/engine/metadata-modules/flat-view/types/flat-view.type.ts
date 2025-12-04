import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
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
    | WorkspaceEntity
    | FieldMetadataEntity
    | UserWorkspaceEntity
    | ApplicationEntity
  >;

export type FlatView = FlatEntityFrom<
  ViewEntity,
  ViewEntityRelationProperties
> & {
  viewFieldIds: string[];
  viewFilterIds: string[];
  viewFilterGroupIds: string[];
  viewGroupIds: string[];
};
