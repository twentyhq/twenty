import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

export declare class ObjectRecordDeleteEvent<T extends BaseObjectMetadata> {
  workspaceId: string;
  deletedRecord: T;
}
