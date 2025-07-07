import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { ObjectMetadataUniqueIdentifier } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-common-v2';

type ObjectActionCommon = ObjectMetadataUniqueIdentifier;
export type CreateObjectAction = {
  type: 'create_object';
  object: ObjectMetadataEntity;
} & ObjectActionCommon;

export type UpdateObjectAction = {
  type: 'update_object';
  updates: (FromTo<Partial<ObjectMetadataEntity>> & { property: string })[];
} & ObjectActionCommon;

export type DeleteObjectAction = {
  type: 'delete_object';
} & ObjectActionCommon;

export type WorkspaceMigrationV2ObjectAction =
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction;
