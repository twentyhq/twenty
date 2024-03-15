import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';

export type CreatedObjectMetadata = {
  nameSingular: string;
  isCustom: boolean;
};

export class ObjectRecordCreateEvent<T extends BaseObjectMetadata> {
  workspaceId: string;
  createdRecord: T;
  createdObjectMetadata: CreatedObjectMetadata;
}
