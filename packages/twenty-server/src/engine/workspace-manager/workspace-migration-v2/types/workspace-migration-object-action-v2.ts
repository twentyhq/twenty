import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { WorkspaceMigrationObjectWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationObjectInputPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/workspace-migration-object-metadata-input-comparator.util';

type ObjectActionCommon = {
  objectMetadataInput: WorkspaceMigrationObjectWithoutFields;
};
export type CreateObjectAction = {
  type: 'create_object';
} & ObjectActionCommon;

export type UpdateObjectAction = {
  type: 'update_object';
  updates: Partial<
    {
      [P in WorkspaceMigrationObjectInputPropertiesToCompare]: {
        property: P;
      } & FromTo<ObjectMetadataEntity[P]>;
    }[WorkspaceMigrationObjectInputPropertiesToCompare]
  >[];
} & ObjectActionCommon;

export type DeleteObjectAction = {
  type: 'delete_object';
} & ObjectActionCommon;

export type WorkspaceMigrationV2ObjectAction =
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction;
