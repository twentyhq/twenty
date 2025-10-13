import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type ViewGroupEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    ViewGroupEntity,
    FieldMetadataEntity | ViewEntity | Workspace
  >;

export type FlatViewGroup = Omit<
  ViewGroupEntity,
  ViewGroupEntityRelationProperties
> & {
  universalIdentifier: string;
};
