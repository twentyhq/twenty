import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { FlatObjectMetadataPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration-v2/utils/flat-object-metadata-comparator.util';

type ObjectActionCommon = {
  flatObjectMetadata: FlatObjectMetadataWithoutFields;
};
export type CreateObjectAction = {
  type: 'create_object';
} & ObjectActionCommon;

export type UpdateObjectAction = {
  type: 'update_object';
  updates: Partial<
    {
      [P in FlatObjectMetadataPropertiesToCompare]: {
        property: P;
      } & FromTo<ObjectMetadataEntity[P]>;
    }[FlatObjectMetadataPropertiesToCompare]
  >[];
} & ObjectActionCommon;

export type DeleteObjectAction = {
  type: 'delete_object';
} & ObjectActionCommon;

export type WorkspaceMigrationObjectActionV2 =
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction;
