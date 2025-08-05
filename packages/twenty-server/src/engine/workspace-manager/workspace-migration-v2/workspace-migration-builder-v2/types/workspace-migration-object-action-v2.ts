import { FromTo } from 'twenty-shared/types';

import { FlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FlatObjectMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-object-metadata/utils/compare-two-flat-object-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';

export type CreateObjectAction = {
  type: 'create_object';
  flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields;
  createFieldActions: CreateFieldAction[];
};

export type UpdateObjectAction = {
  type: 'update_object';
  objectMetadataId: string;
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
  objectMetadataId: string;
};

export type WorkspaceMigrationObjectActionV2 =
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction;

export type WorkspaceMigrationObjectActionTypeV2 =
  WorkspaceMigrationObjectActionV2['type'];
