import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';

export declare class ObjectRecordDeleteEvent<T extends BaseObjectMetadata> {
  workspaceId: string;
  deletedRecord: T;
}
