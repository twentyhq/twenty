import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { FlatObjectMetadataPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration-v2/utils/flat-object-metadata-comparator.util';
import { CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';

export type CreateObjectAction = {
  type: 'create_object';
  flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields;
  createFieldActions: CreateFieldAction[];
};

export type UpdateObjectAction = {
  type: 'update_object';
  flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields;
  updates: Array<
    {
      [P in FlatObjectMetadataPropertiesToCompare]: {
        property: P;
      } & FromTo<ObjectMetadataEntity[P]>;
    }[FlatObjectMetadataPropertiesToCompare]
  >;
};

export type DeleteObjectAction = {
  type: 'delete_object';
  flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields;
};

export type WorkspaceMigrationObjectActionV2 =
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction;

export type WorkspaceMigrationObjectActionTypeV2 =
  WorkspaceMigrationObjectActionV2['type'];
