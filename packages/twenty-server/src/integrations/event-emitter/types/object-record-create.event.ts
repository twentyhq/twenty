import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

export class ObjectRecordCreateEvent<T extends BaseObjectMetadata> {
  workspaceId: string;
  createdRecord: T;
}
