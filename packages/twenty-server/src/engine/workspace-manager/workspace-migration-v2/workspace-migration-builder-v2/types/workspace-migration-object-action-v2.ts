import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FlattenObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { FlattenObjectMetadataPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration-v2/utils/flatten-object-metadata-comparator.util';

type ObjectActionCommon = {
  flattenObjectMetadata: FlattenObjectMetadataWithoutFields;
};
export type CreateObjectAction = {
  type: 'create_object';
} & ObjectActionCommon;

export type UpdateObjectAction = {
  type: 'update_object';
  updates: Partial<
    {
      [P in FlattenObjectMetadataPropertiesToCompare]: {
        property: P;
      } & FromTo<ObjectMetadataEntity[P]>;
    }[FlattenObjectMetadataPropertiesToCompare]
  >[];
} & ObjectActionCommon;

export type DeleteObjectAction = {
  type: 'delete_object';
} & ObjectActionCommon;

export type WorkspaceMigrationObjectActionV2 =
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction;
